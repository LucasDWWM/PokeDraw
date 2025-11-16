<?php
// CORS pour pouvoir appeler l'API depuis Vite (5173)
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // réponse vide pour les preflight
    exit;
}

// --- fichier de stockage simple ---
define('ROOMS_FILE', 'rooms.json');

if (!file_exists(ROOMS_FILE)) {
    file_put_contents(ROOMS_FILE, json_encode([]));
}

$action = $_GET['action'] ?? '';

function readRooms() {
    return json_decode(file_get_contents(ROOMS_FILE), true);
}

function writeRooms($rooms) {
    file_put_contents(ROOMS_FILE, json_encode($rooms, JSON_PRETTY_PRINT));
}

// --- actions ---
switch ($action) {

    // Liste complète des salons
    case 'list':
        echo json_encode(readRooms());
        break;

    // Récupérer un salon précis
    case 'get':
        $id = $_GET['id'] ?? '';
        if (!$id) { echo json_encode(['error' => 'id requis']); exit; }

        $rooms = readRooms();
        foreach ($rooms as $room) {
            if ($room['id'] === $id) {
                echo json_encode($room);
                exit;
            }
        }
        echo json_encode(['error' => 'Salon introuvable']);
        break;

    // Création d’un salon
    case 'create':
        $name     = $_POST['name'] ?? '';
        $password = $_POST['password'] ?? '';
        $player   = $_POST['player'] ?? 'Guest';

        if (!$name) { echo json_encode(['error'=>'Nom requis']); exit; }

        $rooms = readRooms();
        $id = time() . rand(1000,9999);

        $rooms[] = [
            'id'              => (string)$id,
            'name'            => $name,
            'password'        => $password,
            'status'          => 'waiting',
            'players'         => [
                ['name' => $player],   // le créateur est déjà dans la room
            ],
            'pokemonId'       => null,
            'pokemonNameFr'   => null,
            'drawings'        => [],
            'currentRound'    => 1,
            'currentPlayerIndex' => 0,
            'phase'              => 'drawing', 
        ];

        writeRooms($rooms);
        echo json_encode(end($rooms));
        break;

    // Rejoindre un salon
    case 'join':
        // le front peut envoyer "id" ou "roomId"
        $id       = $_POST['roomId'] ?? ($_POST['id'] ?? '');
        $player   = $_POST['player'] ?? 'Guest';
        $password = $_POST['password'] ?? '';

        $rooms = readRooms();
        $roomFound = false;

        foreach ($rooms as &$room) {
            if ($room['id'] === $id) {
                $roomFound = true;

                // vérif mot de passe si défini
                if ($room['password'] !== '' && $room['password'] !== $password) {
                    echo json_encode(['error'=>'Mot de passe incorrect']); exit;
                }

                if (count($room['players']) >= 4) {
                    echo json_encode(['error'=>'Salon plein']); exit;
                }

                // éviter doublons de joueur
                $names = array_column($room['players'], 'name');
                if (!in_array($player, $names, true)) {
                    $room['players'][] = ['name'=>$player];
                }

                // statut
                if (count($room['players']) === 4) {
                    $room['status'] = 'full';
                } else {
                    $room['status'] = 'in-progress';
                }

                // valeurs par défaut si pas encore présentes
                if (!isset($room['currentRound']))        $room['currentRound'] = 1;
                if (!isset($room['currentPlayerIndex'])) $room['currentPlayerIndex'] = 0;
                if (!isset($room['drawings']))           $room['drawings'] = [];
                if (!isset($room['phase'])) $room['phase'] = 'drawing';

                writeRooms($rooms);
                echo json_encode($room);
                exit;
            }
        }

        if (!$roomFound) echo json_encode(['error'=>'Salon introuvable']);
        break;

    // Définir le Pokémon de la manche
    case 'setPokemon':
        $id            = $_POST['id'] ?? '';
        $pokemonId     = $_POST['pokemonId'] ?? '';
        $pokemonNameFr = $_POST['pokemonNameFr'] ?? '';

        $rooms = readRooms();
        foreach ($rooms as &$room) {
            if ($room['id'] === $id) {
                $room['pokemonId']     = $pokemonId;
                $room['pokemonNameFr'] = $pokemonNameFr;
                writeRooms($rooms);
                echo json_encode(['success'=>true]);
                exit;
            }
        }
        echo json_encode(['error'=>'Salon introuvable']);
        break;

    // Enregistrer un dessin
    case 'submitDrawing':
        $roomId  = $_POST['roomId'] ?? '';
        $player  = $_POST['player'] ?? 'Guest';
        $drawing = $_POST['drawing'] ?? '';

        if (!$roomId || !$drawing) {
            echo json_encode(['error' => 'Données manquantes']);
            exit;
        }

        $rooms = readRooms();
        foreach ($rooms as &$room) {
            if ($room['id'] === $roomId) {
                if (!isset($room['drawings']) || !is_array($room['drawings'])) {
                    $room['drawings'] = [];
                }

                // on enregistre le dessin pour ce joueur
                $room['drawings'][$player] = $drawing;

                $playersCount  = isset($room['players']) ? count($room['players']) : 0;
                $drawingsCount = count($room['drawings']);

                // trouver l'index du joueur qui vient de dessiner
                $playerIndex = 0;
                if ($playersCount > 0) {
                    foreach ($room['players'] as $idx => $p) {
                        if ($p['name'] === $player) {
                            $playerIndex = $idx;
                            break;
                        }
                    }
                }

                if ($playersCount > 0 && $drawingsCount >= $playersCount) {
                    // tout le monde a dessiné : on passe en phase "results"
                    $room['phase'] = 'results';
                } else {
                    // sinon on passe au joueur suivant
                    if ($playersCount > 0) {
                        $room['currentPlayerIndex'] = ($playerIndex + 1) % $playersCount;
                    }
                }

                writeRooms($rooms);
                echo json_encode(['success' => true]);
                exit;
            }
        }
        echo json_encode(['error' => 'Salon introuvable']);
        break;

    // Passer à la manche suivante
    case 'nextRound':
        $roomId = $_POST['roomId'] ?? '';
        if (!$roomId) { echo json_encode(['error'=>'roomId requis']); exit; }

        $rooms = readRooms();
        foreach ($rooms as &$room) {
            if ($room['id'] === $roomId) {

                $currentRound  = $room['currentRound'] ?? 1;
                $currentIndex  = $room['currentPlayerIndex'] ?? 0;
                $playersCount  = isset($room['players']) ? count($room['players']) : 0;

                $room['currentRound'] = $currentRound + 1;

                if ($playersCount > 0) {
                    $room['currentPlayerIndex'] = ($currentIndex + 1) % $playersCount;
                }

                // reset de la manche
                $room['pokemonId']     = null;
                $room['pokemonNameFr'] = null;
                $room['drawings']      = [];

                writeRooms($rooms);
                echo json_encode($room);
                exit;
            }
        }
        echo json_encode(['error'=>'Salon introuvable']);
        break;

        // Quitter un salon
        case 'leave':
        $roomId = $_POST['roomId'] ?? '';
        $player = $_POST['player'] ?? 'Guest';

        if (!$roomId) {
            echo json_encode(['error' => 'roomId requis']);
            exit;
        }

        $rooms = readRooms();
        $roomIndex = null;

        foreach ($rooms as $index => &$room) {
            if ($room['id'] === $roomId) {
                $roomIndex = $index;

                // filtrer les joueurs
                $room['players'] = array_values(array_filter(
                    $room['players'],
                    fn($p) => $p['name'] !== $player
                ));

                $count = count($room['players']);

                if ($count === 0) {
                    // plus personne -> on supprime la room
                    unset($rooms[$index]);
                    $rooms = array_values($rooms);
                } else {
                    // on remet le statut à jour
                    if ($count < 4 && $room['status'] === 'full') {
                        $room['status'] = $count === 1 ? 'waiting' : 'in-progress';
                    } else if ($count === 1) {
                        $room['status'] = 'waiting';
                    }
                }

                writeRooms($rooms);
                echo json_encode(['success' => true]);
                exit;
            }
        }

        echo json_encode(['error' => 'Salon introuvable']);
        break;

    default:
        echo json_encode(['error'=>'Action invalide']);
        break;
}
?>