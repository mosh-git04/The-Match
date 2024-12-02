$(document).ready(function() {
    
    // Start Game Button Click
    $("#start-btn").click(function() {
        $("#menu").hide();           // Hide the main menu
        $("#gameSelector").show();    // Show the game selector
    });

    // Instructions Button Click
    $("#instructions-btn").click(function() {
        $("#menu").hide();            // Hide the main menu
        $("#instructions").show();    // Show the instructions screen
    });

    // Back Button Click from Instructions
    $("#back-btn").click(function() {
        $("#instructions").hide();    // Hide the instructions screen
        $("#menu").show();            // Show the main menu
    });

    // Exit Button (optional)
    $("#exit-btn").click(function() {
        window.close();
    });

    // Store original text before correct/wrong changes
    $(".draggable").each(function() {
        $(this).data("original-text", $(this).text());
    });

    // Initially hide game selector and instructions
    $("#gameSelector").hide();
    $("#instructions").hide();
    
    // Game data and arrays for countries and flags
    const countryData = [
        { name: 'Scotland', flag: 'Scotland.png' },
        { name: 'Canada', flag: 'Canada.jpg' },
        { name: 'Brazil', flag: 'Brazil.webp' },
        { name: 'England', flag: 'England.webp' },
        { name: 'France', flag: 'France.png' },
        { name: 'Germany', flag: 'Germany.png' },
        { name: 'USA', flag: 'USA.webp' },
        { name: 'Japan', flag: 'Japan.png' }
    ];

    let score = 0;
    let level = 1;

    // Start game
    $('#flag-btn').click(function() {
        $('#game-selection').hide();
        $('#flag-game').show();
        loadLevel(level);
    });

    // Drag and drop functionality
    function loadLevel(level) {
        const levelData = getLevelData(level);
        let draggableHtml = '';
        let droppableHtml = '';

        // Create draggable elements for countries
        levelData.countries.forEach(country => {
            draggableHtml += `<div class="draggable" data-country="${country.name}">${country.name}</div>`;
        });

        // Create droppable elements for flags
        levelData.flags.forEach(flag => {
            droppableHtml += `<div class="droppable" data-country="${flag.name}">
                                <img src="flag-game/flags/${flag.flag}" alt="${flag.name}">
                              </div>`;
        });

        $('.countries').html(draggableHtml);
        $('.flags').html(droppableHtml);

        // Enable drag and drop interactions
        enableDragAndDrop();
    }

    // Get data for the current level
    function getLevelData(level) {
        const countriesPerLevel = 4;
        const startIndex = (level - 1) * countriesPerLevel;
        const levelCountries = countryData.slice(startIndex, startIndex + countriesPerLevel);

        return {
            countries: levelCountries,
            flags: levelCountries.map(country => ({
                name: country.name,
                flag: country.flag
            }))
        };
    }

    // Enable drag and drop for current level
    function enableDragAndDrop() {
        $('.draggable').draggable({
            revert: "invalid",
            cursor: "move"
        });

        $('.droppable').droppable({
            accept: '.draggable',
            drop: function(event, ui) {
                const draggable = ui.helper;
                const droppable = $(this);
                const correctCountry = droppable.data('country');

                if (draggable.data('country') === correctCountry) {
                    draggable.addClass('correct');
                    droppable.addClass('correct');
                    score++;
                    $('#scoreDisplay').text(`Score: ${score}`);
                    if (score === 4) {
                        $('#nextLevel').show();
                    }
                } else {
                    draggable.addClass('incorrect');
                }
            }
        });
    }

    // Handle the guess button and move to next level
    $('#guessButton').click(function() {
        if (score === 4) {
            level++;
            loadLevel(level);
            score = 0;
            $('#scoreDisplay').text(`Score: ${score}`);
        }
    });

    // Back to menu button
    $('#back-to-menu').click(function() {
        $('#flag-game').hide();
        $('#game-selection').show();
    });
});
