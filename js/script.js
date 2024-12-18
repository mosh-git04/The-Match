$(document).ready(function() {
    // Hide menu and show game selection screen when start button is clicked
    $("#start-btn").click(function() {
        $("#menu").hide();        
        $("#game-selection").show();    
    });

    // Hide menu and show instructions screen when instructions button is clicked
    $("#instructions-btn").click(function() {
        $("#menu").hide();          
        $("#instructions").show();    
    });

    // Show scoreboard when scoreboard button is clicked
    $("#scoreboard-btn").click(function() {
        $("#menu").hide();           
        $("#scoreboard").show();
        displayScoreboard();
    });

    // Hide instructions or scoreboard and go back to the main menu
    $(".back-btn").click(function() {
        $("#instructions").hide();    
        $("#scoreboard").hide(); 
        $("#menu").show();            
    });

    // Close the browser window when exit button is clicked
    $("#exit-btn").click(function() {
        window.close();
    });

    // Store original text for draggable elements
    $(".draggable").each(function() {
        $(this).data("original-text", $(this).text());
    });

    // Initially hide game selection and instructions screens
    $("#game-selection").hide();
    $("#instructions").hide();

    // Audio control for background music
    const audiobtn = $("#audio-btn");
    const icon = $("#audio-btn > i");
    const audio = $("audio")[0];

    audiobtn.on("click", function(){
        if (audio.paused){
            audio.volume = 0.3;
            audio.play();
            icon.removeClass('fa-volume-mute');
            icon.addClass('fa-volume-up');
        } else{
            audio.pause();
            icon.removeClass('fa-volume-up');
            icon.addClass('fa-volume-mute');
        }
    });

    // Play interaction audio for game buttons
    var aud = document.getElementById('interact-audio');
    $(".menu-button, #audio-btn, #brightness-mode, .game-btn, .back-to-menu, .back-btn, #submitName, .guessButton, .nextLevel").on("click", function(){
        aud.play();
    })

    // Toggle brightness mode (light or night)
    document.getElementById("brightness-mode").addEventListener("click", function () {
        const body = document.body;
    
        if (body.classList.contains("light-mode")) {
            // Switching to Night Mode
            body.classList.remove("light-mode");
            body.classList.add("night-mode");
        } else {
            // Switching to Light Mode
            body.classList.remove("night-mode");
            body.classList.add("light-mode");
        }
    });
});


    let countdownTimer;
    let timeRemaining = 20; // Automatic 15-second countdown for making a guess
    let totalTime = 0; // Track total time taken for each game
    let userName = "";
    let totalScore = 0; // Track the total score

    // Username submission function
    $('#submitName').click(function() {
        userName = $("#userName").val().trim();
        var $userNameInput = $('#userName'); // Cache the input field

        // Check if userName is provided
        if (userName) {
            $('#userDisplayName').text(userName); // Display username on game screen after submitted 
            $('#welcome-message').show();
            $('#name-input').hide();
            $('#menu').show();

            // Remove error state
            $userNameInput.css({
                'border': '', // Clear the error border
                'animation': '' // Clear any animation
            });
            $('#errorMessage').text(""); // Clear any previous error messages
        } else {
            // Show error message and add pulsate effect
            $('#errorMessage').text("--Username must not be blank--");
            
            // Username error animation
            $userNameInput.css({ 
                'border': '2px solid red',
                'animation': 'pulsate 0.6s 3' // Add pulsate animation
            });

            // Create the keyframes for the pulsate effect dynamically
            var style = document.createElement('style');
            style.innerHTML = `
                @keyframes pulsate {
                    0% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                    100% {
                        transform: scale(1);
                    }
                }
            `;
            document.head.appendChild(style);

            $userNameInput.focus(); // Focus on the input field to highlight the error
        }
    });

    // Array of different game levels with elements to show/hide
    let levels = [
        {
            name: "Level 1",
            elementsToShow: [".flag-level1", ".character-level1", ".definition-level1"],
            elementsToHide: [".flag-level2", ".character-level2", ".definition-level2", ".flag-level3", ".character-level3", ".definition-level3"]
        },
        {
            name: "Level 2",
            elementsToShow: [".flag-level2", ".character-level2", ".definition-level2"],
            elementsToHide: [".flag-level1", ".character-level1", ".definition-level1", ".flag-level3", ".character-level3", ".definition-level3"]
        },
        {
            name: "Level 3",
            elementsToShow: [".flag-level3", ".character-level3", ".definition-level3"],
            elementsToHide: [".flag-level1", ".character-level1", ".definition-level1", ".flag-level2", ".character-level2", ".definition-level2"]
        },
        {
            // "Level" to handle the end of the game after all levels are played
            name: "End of Game",
            isEnd: true,
            elementsToShow: [".resultBoard", ".resultDisplay"],
            elementsToHide: [
                ".flag-level1", ".flag-level2", ".flag-level3",
                ".character-level1", ".character-level2", ".character-level3",
                ".definition-level1", ".definition-level2", ".definition-level3",
                ".result-container", ".scoreDisplay", ".game-title", ".guessButton", "#nextLevel", ".timerDisplay"
            ],
            showFinalScore: function() {
                $(".resultDisplay").text("Final Score: " + totalScore);
            }
        }
    ];

    // Hide games + game selection screen by default
    $("#game-selection, #flag-game, #character-game, #definition-game").hide();


    // Start button to begin the game
    $("#start-btn").click(function() {
        $("#menu").hide();
        $("#game-selection").show();
    });

    // Button to start flag game and hiding / showing required elements 
    $("#flag-btn").click(function() {
        currentGameType = "flag"; // Set current game type to flag
        $("#game-selection").hide();
        $("#title").hide();
        $("#flag-game").show();
        $(".flag-level2").hide();
        $(".flag-level3").hide();
        $(".resultDisplay").hide();
        resetFullGame(); // Reset the game
        startTimer(); // Start the countdown timer for selected game
    });

    // Button to start character game and hiding / showing required elements 
    $("#character-btn").click(function() {
        currentGameType = "character"; // Set current game type to character
        $("#game-selection").hide();
        $("#title").hide();
        $("#character-game").show();
        $(".character-level2").hide();
        $(".character-level3").hide();
        $(".resultDisplay").hide();
        resetFullGame(); // Reset the game
        startTimer(); // Start the countdown timer for selected game
    });

    // Button to start definition game and hiding / showing required elements 
    $("#definition-btn").click(function(){
        currentGameType = "definition"; // Set current game type to definition
        $("#game-selection").hide();
        $("#title").hide();
        $("#definition-game").show();
        $(".definition-level2").hide();
        $(".definition-level3").hide();
        $(".resultDisplay").hide();
        resetFullGame(); // Reset the game
        startTimer(); // Start the countdown timer for selected game
    })

// Make items draggable and droppable for matching mechanics
$(".draggable").draggable({revert: "invalid"});
$(".droppable").droppable({
    accept: ".draggable",
    drop: function(event, ui) {
        //Store variables for dropped elements and data attributes
        var droppable = $(this);
        var draggable = ui.draggable;
        var droppedCountry = ui.draggable.data("country");
        var flagCountry = $(this).data("country");
        var droppedCharacter = ui.draggable.data("character");
        var characterImage = $(this).data("character");
        var droppedWord = ui.draggable.data("word");
        var definition = $(this).data("word");

        // Logic for matching draggables and droppables
        let isMatched = false;  // Default match status

        // Check match conditions based on data attributes
        if (droppedCountry && flagCountry) {
            isMatched = droppedCountry === flagCountry;
        } else if (droppedCharacter && characterImage) {
            isMatched = droppedCharacter === characterImage;
        } else if (droppedWord && definition) {
            isMatched = droppedWord === definition;
        }

        ui.draggable.data("matched", isMatched);  // Store if matched

        // Add the class to indicate a successful drop
        $(this).addClass("ui-droppable-dropped");

        // Position the draggable item on the droppable area to make it centered
        ui.draggable.position({
            my: "center",
            at: "center",
            of: $(this)
        });

        
        draggable.data("droppable", droppable);
        draggable.css("z-index", 15); // Set a higher z-index to keep draggables in front of the droppable
    }
});



//Function for guessButton click
$(document).on("click", ".guessButton", function() {
    let correctAnswers = 0; // Initialize correctAnswers variable for level

    // Iterate over each draggable that is visible to check for correct answers
    $(".draggable:visible").each(function() {
        // Check if the draggable has been matched
        var isMatched = $(this).data("matched") === true;

        // Hide the draggable after it has been matched
        $(this).hide();

        // Get the droppable associated with the draggable
        var droppable = $(this).data("droppable");

        // Add to the summary list
        var itemName = $(this).text();
        if (isMatched) {
            $(".summaryList").append(`<li class="correct-item">${itemName}: <i class="fas fa-check"></li>`);
        } else {
            $(".summaryList").append(`<li class="incorrect-item">${itemName}: <i class="fas fa-times"></li>`);
        }
        
        // Ensure droppable is defined before attempting to append an overlay
        if (droppable) {
            // Add an overlay element to the droppable indicating correct/incorrect
            if (isMatched) {
                // Append a checkmark icon to the droppable area if correct
                droppable.append('<div class="overlay checkmark"><i class="fas fa-check"></i></div>');
            } else {
                // Append a cross icon to the droppable area if incorrect
                droppable.append('<div class="overlay crossmark"><i class="fas fa-times"></i></div>');
            }
        }

        // Update the total score for correct matches
        if (isMatched) {
            correctAnswers++;
        }
    });

    $(".summaryContainer").addClass("summaryGuessed");
    clearInterval(countdownTimer);

    // Update the total score for the current game
    totalScore += correctAnswers;

    // Update the score display
    $(".scoreDisplay").text("Score: " + totalScore);
    $(".scoreDisplay").show(); // Ensure the score display is visible

   // Hide the guess button and show the next level button
$(".guessButton").hide();

// Ensure the next level button is visible
$(".nextLevel").show(); // Use jQuery's show() to ensure it's visible


});
let currentLevel = 1; // Variable to track the current level


    // Function to start the timer
    function startTimer() {

        // Set different duration for definition game due to required reading - with increased difficulty 
        if (currentGameType === 'definition') {
            if (currentLevel === 1) {
                timeRemaining = 45; // 25 seconds for Level 1
            } else if (currentLevel === 2) {
                timeRemaining = 40; // 20 seconds for Level 2
            } else if (currentLevel === 3) {
                timeRemaining = 35; // 15 seconds for Level 3
            }
        } else {
            timeRemaining = 20; // Default to 15 seconds for other games
        }
        
        $('.timerDisplay').text(`Time Left: ${timeRemaining}s`);

        countdownTimer = setInterval(function() {
            timeRemaining--; // Tick down time remaining by 1s
            $('.timerDisplay').text(`Time Left: ${timeRemaining}s`);
            totalTime++ // Add 1s to the total time played 
            if (timeRemaining <= 0) {
                clearInterval(countdownTimer); 
                autoGuess();
            }
        }, 1000);
    }

    // Function to automatically guess when time runs out
    function autoGuess() {
        $(".guessButton").click(); // Trigger guess button click
    }

// Logic for the next level button
$(document).on("click", ".nextLevel", function() {
    // Hide the current game container elements
    $(".game-container:visible").hide(); // Hide only visible game containers
    $(".nextLevel").hide(); // Hide the next level button
    $(".guessButton").show(); // Show guess button for the next round

    // Increment the level
    currentLevel++;
    
    // Show the appropriate level based on the current level
    if (currentLevel > levels.length) {
        // End of the game, show results
        $(".resultDisplay").text("Final Score: " + totalScore);
        $("#resultBoard").show();
        $(".game-title").hide();
        currentLevel = 1; // Reset to level 1
    } else {
        // Access the current level data from the array
        let currentLevelData = levels[currentLevel - 1];

        // Hide elements not required for the current level
        currentLevelData.elementsToHide.forEach(element => {
            $(element).hide();
        });

        // Show elements required for the current level
        currentLevelData.elementsToShow.forEach(element => {
            $(element).show();
        });

    // If end of the game, run the function to update the score
    if (currentLevelData.isEnd && typeof currentLevelData.showFinalScore === 'function') {
        currentLevelData.showFinalScore();
    } else {
        // If not end of game, reset level elements and show the guess button
        resetGame(resetLevels = true, resetScores = false, resetDraggables = true); // Reset game for next level without resetting current score
        $("#guessButton").show(); // Ensure the guess button is shown for the next level
        $(".summaryContainer").removeClass("summaryGuessed");
    }

    clearInterval(countdownTimer); // Clear any existing timer
    startTimer(); // Start a new countdown timer


    }    
});

// Restart Game Button Click
$(".restart-btn").click(function() {
    saveGameData(); // Save game data when the game ends
    $(".resultBoard").hide(); 
    $(".resultDisplay").hide();
    resetFullGame(); // Reset the game
    $(".scoreDisplay").show();
    $(".game-title").show();
    $(".result-container").show();
    $(".summaryContainer").removeClass("summaryGuessed"); // Remove the guessed class from the summary container
    $(".summaryList").empty(); // Empty the summary list
    clearInterval(countdownTimer); // Clear any existing timer
});

$(document).on("click", ".back-to-menu", function () {
    saveGameData(); // Save game data when the game ends
    // Hide all game containers
    $("#flag-game, #character-game, #definition-game, .flag-level2, .flag-level3, .character-level2, .character-level3, .definition-level2, .definition-level3, .nextLevel").hide();
    $(".guessButton").show();
    
    // Reset game elements
    resetFullGame();

    // Reset scores and levels
    totalScore = 0;
    currentLevel = 1;

    // Show the main menu
    $("#menu").show();

    // Hide any lingering elements
    $(".resultBoard").hide();
    $(".result-container").show(); // Ensure result container is visible for the next game
    $(".game-title, .scoreDisplay").show(); // Reset title and score display visibility

    // Reset the summary list
    $(".summaryList").empty();

    // Reset overlays from droppables
    $(".droppable .overlay").remove();
    clearInterval(countdownTimer);
});

// Function to reset the full game
function resetFullGame() {
    resetGame();
    $(".flag-level2, .flag-level3").hide(); // Hide level 2 and 3 elements
    $(".game-container").show();            // Show level 1 elements
    $(".guessButton").show();               // Ensure the guess button is visible
    $(".nextLevel").hide();                 // Hide the next level button
    currentLevel = 1;          
    $(".scoreDisplay").text("Score: 0");          // Reset score
    $(".timerDisplay").show();
}

// Function to reset draggable items for the next level
function resetGame(resetLevels = true, resetScores = true, resetDraggables = true) {
    if (resetDraggables) {
        $(".draggable").each(function () {
            $(this).data("matched", false); // Reset match status
            $(this).removeClass("correct incorrect ui-draggable-dropped"); // Remove classes
            $(this).draggable("enable"); // Enable dragging again
            $(this).text($(this).data("original-text")); // Reset to original text
            $(this).show(); // Ensure draggable items are visible

            // Reset draggables positions
            $(this).css({
                top: "initial",
                left: "initial",
            });
        });
    }

    if (resetLevels) {
        $(".droppable").each(function () {
            $(this).removeClass("ui-droppable-dropped");
            $(this).droppable("enable"); // Re-enable droppable areas
        });
    }

    if (resetScores) {
        totalScore = 0; // Reset the total score
        $("#scoreDisplay").text("Score: 0"); // Reset score display
    }

    // Remove any overlays
    $(".droppable .overlay").remove();
    $(".summaryContainer").removeClass("summaryGuessed");  
}

    // Function to save game data to local storage
    function saveGameData() {
        let gameData = {
            userName: userName, // Save the user's name
            totalScore: totalScore, // Save the total score
            totalTime: totalTime, // Save the total time played
            gameType: currentGameType // Save the current game type
        };

        // Check if there is already data in local storage
        let scoreboard = JSON.parse(localStorage.getItem('scoreboard')) || [];
        scoreboard.push(gameData);
        localStorage.setItem('scoreboard', JSON.stringify(scoreboard));

    }

    // Display the scoreboard from local storage
    function displayScoreboard() {
        let scoreboard = JSON.parse(localStorage.getItem('scoreboard')) || [];
        let flagGameHtml = "<h3>Match The Flag Scores</h3>";
        let characterGameHtml = "<h3>Match The Characters Scores</h3>";
        let definitionGameHtml = "<h3>Match The Definition Scores</h3>";

    // Add headings for each scoreboard column
    let scoreboardHeader = `
        <div class="scoreboard-header">
            <span>Name</span>
            <span>Score</span>
            <span>Total Time</span>
        </div>`;

        // Sort the scoreboard array
        scoreboard.sort((a, b) => {
            if (b.totalScore === a.totalScore) {
                return a.totalTime - b.totalTime; // If scores are equal, sort by total time (ascending)
            }
            return b.totalScore - a.totalScore; // Sort by total score (descending)
        });
        
    //Check if there are any recorded scores
    if (scoreboard.length === 0) {
        flagGameHtml += "<p>No scores recorded yet for Match The Flag.</p>";
        characterGameHtml += "<p>No scores recorded yet for Match The Characters.</p>";
        definitionGameHtml += "<p>No scores recorded yet for Match The Definition.</p>";
    } else {
        // Add the header to each game
        flagGameHtml += scoreboardHeader;
        characterGameHtml += scoreboardHeader;
        definitionGameHtml += scoreboardHeader;

        // Iterate through the scoreboard and add each score to the HTML
        scoreboard.forEach(function(entry) {
            let entryHtml = `
                <div class="score-entry">
                    <span>${entry.userName}</span>
                    <span>${entry.totalScore}</span>
                    <span>${entry.totalTime}s</span>
                </div>`;

            // Add the entry to the corresponding game scoreboard
            if (entry.gameType === 'flag') {
                flagGameHtml += entryHtml;
            } else if (entry.gameType === 'character') {
                characterGameHtml += entryHtml;
            } else if (entry.gameType === 'definition') {
                definitionGameHtml += entryHtml;
            }
        });
    }
        // Display the scoreboard HTML to correct game scoreboard column
        $("#scoreboard-content").html(
            `<div class="scoreboard-column">${flagGameHtml}</div>
             <div class="scoreboard-column">${characterGameHtml}</div>
             <div class="scoreboard-column">${definitionGameHtml}</div>`
        );
    };