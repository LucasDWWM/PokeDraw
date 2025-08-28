<?php
header('Content-Type: application/json');

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

    case 'list':
        echo json_encode(readRooms());
        break;

    case 'create':
        $name = $_POST['name'] ?? '';
        $password = $_POST['password'] ?? '';
        if (!$name) { echo json_encode(['error'=>'Nom requis']); exit; }

        $rooms = readRooms();
        $id = time() . rand(1000,9999);

        $rooms[] = [
            'id' => (string)$id,
            'name' => $name,
            'password' => $password,
            'status' => 'waiting',
            'players' => [],
            'pokemonId' => null,
            'pokemonNameFr' => null,
            'drawings' => []
        ];

        writeRooms($rooms);
        echo json_encode(end($rooms));
        break;

    case 'join':
        $id = $_POST['id'] ?? '';
        $player = $_POST['player'] ?? 'Guest';
        $password = $_POST['password'] ?? '';

        $rooms = readRooms();
        $roomFound = false;

        foreach ($rooms as &$room) {
            if ($room['id'] === $id) {
                $roomFound = true;

                if ($room['password'] !== $password) {
                    echo json_encode(['error'=>'Mot de passe incorrect']); exit;
                }

                if (count($room['players']) >= 4) {
                    echo json_encode(['error'=>'Salon plein']); exit;
                }

                if (!in_array($player, array_column($room['players'], 'name'))) {
                    $room['players'][] = ['name'=>$player];
                }

                if(count($room['players']) === 4) $room['status']='full';
                else $room['status']='in-progress';

                writeRooms($rooms);
                echo json_encode($room);
                exit;
            }
        }

        if (!$roomFound) echo json_encode(['error'=>'Salon introuvable']);
        break;

    case 'setPokemon':
        $id = $_POST['id'] ?? '';
        $pokemonId = $_POST['pokemonId'] ?? '';
        $pokemonNameFr = $_POST['pokemonNameFr'] ?? '';

        $rooms = readRooms();
        foreach ($rooms as &$room) {
            if ($room['id'] === $id) {
                $room['pokemonId'] = $pokemonId;
                $room['pokemonNameFr'] = $pokemonNameFr;
                writeRooms($rooms);
                echo json_encode(['success'=>true]);
                exit;
            }
        }
        echo json_encode(['error'=>'Salon introuvable']);
        break;

    case 'submitDrawing':
        $roomId = $_POST['roomId'] ?? '';
        $player = $_POST['player'] ?? 'Guest';
        $drawing = $_POST['drawing'] ?? '';

        if(!$roomId || !$drawing){ echo json_encode(['error'=>'Données manquantes']); exit; }

        $rooms = readRooms();
        foreach ($rooms as &$room) {
            if ($room['id'] === $roomId) {
                $room['drawings'][$player] = $drawing;
                writeRooms($rooms);
                echo json_encode(['success'=>true]);
                exit;
            }
        }
        echo json_encode(['error'=>'Salon introuvable']);
        break;

    default:
        echo json_encode(['error'=>'Action invalide']);
        break;
}
?>
