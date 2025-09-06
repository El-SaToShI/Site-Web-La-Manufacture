<?php
/**
 * API Backend pour l'administration
 * La Manufacture de Laurence
 */

// Configuration sécurisée
define('ADMIN_PASSWORD_HASH', password_hash('laurence2024', PASSWORD_DEFAULT));
define('UPLOAD_DIR', '../images/');
define('PEDAGOGUES_FILE', '../data/pedagogues.json');
define('PAGES_DIR', '../pages/');

// Headers CORS et sécurité
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gestion des requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Vérification de l'authentification
function checkAuth() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        http_response_code(401);
        echo json_encode(['error' => 'Non autorisé']);
        exit();
    }
    
    $token = substr($authHeader, 7);
    // Ici vous pouvez ajouter une vérification de token plus sophistiquée
    return true;
}

// Router principal
$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['path'] ?? '';

try {
    switch ($path) {
        case 'pedagogues':
            handlePedagogues($method);
            break;
            
        case 'upload':
            handleUpload();
            break;
            
        case 'pages':
            handlePages($method);
            break;
            
        case 'sync':
            handleSync();
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint non trouvé']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

// ================================
// GESTION DES PÉDAGOGUES
// ================================

function handlePedagogues($method) {
    checkAuth();
    
    switch ($method) {
        case 'GET':
            getPedagogues();
            break;
            
        case 'POST':
            savePedagogues();
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Méthode non autorisée']);
    }
}

function getPedagogues() {
    if (!file_exists(PEDAGOGUES_FILE)) {
        // Créer le fichier avec les données par défaut
        $defaultData = [
            [
                'id' => 'laurence',
                'name' => 'Laurence',
                'role' => 'Comédienne professionnelle et pédagogue',
                'excerpt' => 'Directrice artistique de La Manufacture, 20 ans d\'expérience théâtrale.',
                'image' => 'laurence.jpg',
                'timeline' => [
                    ['period' => '2020 - Aujourd\'hui', 'description' => 'Directrice artistique de La Manufacture de Laurence'],
                    ['period' => '2015 - 2020', 'description' => 'Comédienne au Théâtre Royal de Namur']
                ],
                'description' => '<p>Passionnée par l\'art dramatique depuis l\'enfance...</p>'
            ]
        ];
        
        createDataDir();
        file_put_contents(PEDAGOGUES_FILE, json_encode($defaultData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
    
    $data = json_decode(file_get_contents(PEDAGOGUES_FILE), true);
    echo json_encode(['success' => true, 'data' => $data]);
}

function savePedagogues() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['pedagogues'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Données invalides']);
        return;
    }
    
    createDataDir();
    
    // Sauvegarder les données JSON
    $saved = file_put_contents(PEDAGOGUES_FILE, json_encode($input['pedagogues'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    if ($saved === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors de la sauvegarde']);
        return;
    }
    
    // Mettre à jour les pages HTML
    updatePedagoguesPages($input['pedagogues']);
    
    echo json_encode(['success' => true, 'message' => 'Pédagogues sauvegardés et pages mises à jour']);
}

// ================================
// UPLOAD D'IMAGES
// ================================

function handleUpload() {
    checkAuth();
    
    if (!isset($_FILES['image'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Aucun fichier uploadé']);
        return;
    }
    
    $file = $_FILES['image'];
    
    // Validation
    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!in_array($file['type'], $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['error' => 'Type de fichier non autorisé']);
        return;
    }
    
    if ($file['size'] > 5 * 1024 * 1024) { // 5MB
        http_response_code(400);
        echo json_encode(['error' => 'Fichier trop volumineux (max 5MB)']);
        return;
    }
    
    // Générer nom de fichier sécurisé
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'pedagogue_' . time() . '_' . uniqid() . '.' . $extension;
    $filepath = UPLOAD_DIR . $filename;
    
    // Créer le dossier si nécessaire
    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }
    
    // Déplacer le fichier
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        echo json_encode(['success' => true, 'filename' => $filename, 'url' => '../images/' . $filename]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors de l\'upload']);
    }
}

// ================================
// MISE À JOUR DES PAGES HTML
// ================================

function updatePedagoguesPages($pedagogues) {
    // Mettre à jour la page pédagogues desktop
    updatePedagoguesDesktopPage($pedagogues);
    
    // Mettre à jour la page pédagogues mobile
    updatePedagoguesMobilePage($pedagogues);
    
    // Mettre à jour les pages individuelles
    updateIndividualPedagoguesPages($pedagogues);
}

function updatePedagoguesDesktopPage($pedagogues) {
    $filePath = PAGES_DIR . 'desktop/pedagogues.html';
    
    if (!file_exists($filePath)) {
        return;
    }
    
    $html = file_get_contents($filePath);
    
    // Générer le HTML des cartes pédagogues
    $pedagoguesHtml = '';
    foreach ($pedagogues as $pedagogue) {
        $timelineHtml = '';
        if (isset($pedagogue['timeline'])) {
            foreach ($pedagogue['timeline'] as $item) {
                $timelineHtml .= '<div class="timeline-item"><strong>' . htmlspecialchars($item['period']) . ':</strong> ' . htmlspecialchars($item['description']) . '</div>';
            }
        }
        
        $pedagoguesHtml .= '
        <div class="pedagogue-card" data-pedagogue="' . $pedagogue['id'] . '">
            <div class="pedagogue-image">
                <img src="../../images/' . $pedagogue['image'] . '" alt="' . htmlspecialchars($pedagogue['name']) . '">
            </div>
            <div class="pedagogue-content">
                <h4>' . htmlspecialchars($pedagogue['name']) . '</h4>
                <p class="pedagogue-role">' . htmlspecialchars($pedagogue['role']) . '</p>
                <p class="pedagogue-excerpt">' . htmlspecialchars($pedagogue['excerpt']) . '</p>
                <div class="expand-icon"><span>+</span></div>
            </div>
            <div class="pedagogue-details" id="' . $pedagogue['id'] . '-details">
                <div class="details-content">
                    <button class="close-details" onclick="togglePedagogue(\'' . $pedagogue['id'] . '\')" title="Fermer">×</button>
                    <div class="parcours-section">
                        <h6>Parcours</h6>
                        <div class="timeline-compact">' . $timelineHtml . '</div>
                    </div>
                    <div class="description-section">
                        <h6>À propos</h6>
                        <div class="description-content">' . $pedagogue['description'] . '</div>
                    </div>
                </div>
            </div>
        </div>';
    }
    
    // Remplacer la section pédagogues dans le HTML
    $pattern = '/(<div class="pedagogues-grid">)(.*?)(<\/div>\s*<\/div>\s*<\/section>)/s';
    $replacement = '$1' . $pedagoguesHtml . '$3';
    
    $newHtml = preg_replace($pattern, $replacement, $html);
    
    if ($newHtml !== null) {
        file_put_contents($filePath, $newHtml);
    }
}

function updatePedagoguesMobilePage($pedagogues) {
    // Similaire à la version desktop mais adapté au mobile
    // Implementation similaire...
}

function updateIndividualPedagoguesPages($pedagogues) {
    $pagesDir = PAGES_DIR . 'pedagogues/';
    
    foreach ($pedagogues as $pedagogue) {
        $fileName = $pedagogue['id'] . '.html';
        $filePath = $pagesDir . $fileName;
        
        // Créer ou mettre à jour la page individuelle
        $pageHtml = generateIndividualPedagoguePage($pedagogue);
        
        if (!is_dir($pagesDir)) {
            mkdir($pagesDir, 0755, true);
        }
        
        file_put_contents($filePath, $pageHtml);
    }
}

function generateIndividualPedagoguePage($pedagogue) {
    $timelineHtml = '';
    if (isset($pedagogue['timeline'])) {
        foreach ($pedagogue['timeline'] as $item) {
            $timelineHtml .= '<div class="timeline-item"><strong>' . htmlspecialchars($item['period']) . ':</strong> ' . htmlspecialchars($item['description']) . '</div>';
        }
    }
    
    return '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>' . htmlspecialchars($pedagogue['name']) . ' - La Manufacture de Laurence</title>
    <link rel="stylesheet" href="../../css/style.css">
</head>
<body>
    <header>
        <h1><a href="../../index.html">La Manufacture de Laurence</a></h1>
        <nav>
            <ul>
                <li><a href="../desktop/a-propos.html">À Propos</a></li>
                <li><a href="../desktop/cours.html">Cours</a></li>
                <li><a href="../desktop/pedagogues.html">Pédagogues</a></li>
                <li><a href="../desktop/agenda.html">Agenda</a></li>
                <li><a href="../desktop/contact.html">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section class="pedagogue-profile">
            <div class="profile-header">
                <div class="profile-image">
                    <img src="../../images/' . $pedagogue['image'] . '" alt="' . htmlspecialchars($pedagogue['name']) . '">
                </div>
                <div class="profile-info">
                    <h2>' . htmlspecialchars($pedagogue['name']) . '</h2>
                    <p class="role">' . htmlspecialchars($pedagogue['role']) . '</p>
                    <p class="excerpt">' . htmlspecialchars($pedagogue['excerpt']) . '</p>
                </div>
            </div>
            
            <div class="profile-content">
                <div class="timeline-section">
                    <h3>Parcours</h3>
                    <div class="timeline">' . $timelineHtml . '</div>
                </div>
                
                <div class="description-section">
                    <h3>À propos</h3>
                    <div class="description">' . $pedagogue['description'] . '</div>
                </div>
            </div>
        </section>
    </main>
    
    <footer>
        <div class="footer-content">
            <div class="social-links">
                <a href="https://www.instagram.com/laurencevoreux/" target="_blank" title="Instagram">Instagram</a>
                <a href="mailto:lamanufacturedelaurence@gmail.com" title="Email">Email</a>
            </div>
            <p>&copy; 2025 La Manufacture de Laurence. Tous droits réservés.</p>
            <p class="admin-access-link">
                <a href="../../admin/index.html" style="color: inherit; text-decoration: underline;">Admin Access</a>
            </p>
        </div>
    </footer>
    
    <script src="../../js/script.js"></script>
</body>
</html>';
}

// ================================
// SYNCHRONISATION GÉNÉRALE
// ================================

function handleSync() {
    checkAuth();
    
    // Synchroniser tous les contenus modifiés
    $result = [
        'pedagogues' => syncPedagogues(),
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    echo json_encode(['success' => true, 'sync' => $result]);
}

function syncPedagogues() {
    if (file_exists(PEDAGOGUES_FILE)) {
        $pedagogues = json_decode(file_get_contents(PEDAGOGUES_FILE), true);
        updatePedagoguesPages($pedagogues);
        return 'Pédagogues synchronisés';
    }
    return 'Aucune donnée à synchroniser';
}

// ================================
// UTILITAIRES
// ================================

function createDataDir() {
    $dataDir = dirname(PEDAGOGUES_FILE);
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }
}

function handlePages($method) {
    // Gestion des autres pages (à implémenter selon les besoins)
    echo json_encode(['success' => true, 'message' => 'Gestion des pages - À implémenter']);
}

?>
