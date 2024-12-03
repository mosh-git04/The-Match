$(document).ready(function() {
    // Start Game Button Click
    $("#start-btn").click(function() {
        $("#menu").hide();           // Hide the main menu
        $("#game-selection").show();    // Show the game selector
    });

    // Instructions Button Click
    $("#instructions-btn").click(function() {
        $("#menu").hide();            // Hide the main menu
        $("#instructions").show();    // Show the instructions screen
    });

    // Show scoreboard button
    $("#scoreboard-btn").click(function() {
        $("#menu").hide();           // Hide the main menu
        $("#scoreboard").show();
        displayScoreboard();
    });

    // Back Button Click from Instructions
    $(".back-btn").click(function() {
        $("#instructions").hide();    // Hide the instructions screen
        $("#scoreboard").hide(); // Hide the scoreboard
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
    $("#game-selection").hide();
    $("#instructions").hide();

    //Background Music Buttons
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

    var aud = document.getElementById('interact-audio');
    $(".menu-button, #audio-btn, #brightness-mode, .game-btn, .back-to-menu, .back-btn, #submitName").on("click", function(){
        aud.play();
    })

    document.getElementById("brightness-mode").addEventListener("click", function () {
        const body = document.body;
    
        if (body.classList.contains("light-mode")) {
            // Switching to Night Mode
            body.classList.remove("light-mode");
            body.classList.add("night-mode");
            console.log("Switched to Night Mode");
        } else {
            // Switching to Light Mode
            body.classList.remove("night-mode");
            body.classList.add("light-mode");
            console.log("Switched to Light Mode");
        }
    });
});



    let countdownTimer;
    let timeRemaining = 15; // 15-second countdown for making a guess
    let totalTime = 0; // Track total time taken for each game
    let userName = "";
    let totalScore = 0; // Track the total score

    $('#submitName').click(function() {
        userName = $("#userName").val().trim();
        var $userNameInput = $('#userName'); // Cache the input field

        // Check if userName is provided
        if (userName) {
            $('#userDisplayName').text(userName);
            $('#welcome-message').show();
            $('#name-input').hide();
            $('#menu').show();

            // Remove error state
            $userNameInput.css({
                'border': '',
                'animation': '' // Clear any animation
            });
            $('#errorMessage').text(""); // Clear any previous error messages
        } else {
            // Show error message and add pulsate effect
            $('#errorMessage').text("--Username must not be blank--");
            
            // Define the pulsate animation
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

            $userNameInput.focus(); // Focus on the input field
        }
    });

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
            // Special level to handle the end of the game
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

    // Hide game selection and flag game by default
    $("#game-selection, #flag-game, #character-game, #definition-game").hide();


    // Start button to begin the game
    $("#start-btn").click(function() {
        $("#menu").hide();
        $("#game-selection").show();
    });

    // Flag game button
    $("#flag-btn").click(function() {
        currentGameType = "flag";
        $("#game-selection").hide();
        $("#title").hide();
        $("#flag-game").show();
        $(".flag-level2").hide();
        $(".flag-level3").hide();
        $(".resultDisplay").hide();
        resetFullGame();
        startTimer(); // Start the countdown timer
    });

    // Flag game button
    $("#character-btn").click(function() {
        currentGameType = "character";
        $("#game-selection").hide();
        $("#title").hide();
        $("#character-game").show();
        $(".character-level2").hide();
        $(".character-level3").hide();
        $(".resultDisplay").hide();
        resetFullGame();
        startTimer(); // Start the countdown timer
    });

    $("#definition-btn").click(function(){
        currentGameType = "definition";
        $("#game-selection").hide();
        $("#title").hide();
        $("#definition-game").show();
        $(".definition-level2").hide();
        $(".definition-level3").hide();
        $(".resultDisplay").hide();
        resetFullGame();
        startTimer(); // Start the countdown timer
    })

// Make items draggable (can revert before Guess is clicked)
$(".draggable").draggable({
    revert: "invalid"
});

// Make items droppable
$(".droppable").droppable({
    accept: ".draggable",
    drop: function(event, ui) {
        var droppable = $(this);
        var draggable = ui.draggable;
        var droppedCountry = ui.draggable.data("country");
        var flagCountry = $(this).data("country");
        var droppedCharacter = ui.draggable.data("character");
        var characterImage = $(this).data("character");
        var droppedWord = ui.draggable.data("word");
        var definition = $(this).data("word");

        console.log("Dropped Country:", droppedCountry);
        console.log("Flag Country:", flagCountry);
        console.log("Dropped Character:", droppedCharacter);
        console.log("Character Image:", characterImage);
        console.log("Dropped Word:", droppedWord);
        console.log("Definition:", definition);

        // Determine if the match is correct
        let isMatched = false;  // Declare a single `isMatched` variable to use

        if (droppedCountry && flagCountry) {
            isMatched = droppedCountry === flagCountry;
        } else if (droppedCharacter && characterImage) {
            isMatched = droppedCharacter === characterImage;
        } else if (droppedWord && definition) {
            isMatched = droppedWord === definition;
        }

        ui.draggable.data("matched", isMatched);  // Store if matched
        console.log("Match status:", isMatched);

        // Add the class to indicate a successful drop
        $(this).addClass("ui-droppable-dropped");

        // Position the draggable item on the droppable area
        ui.draggable.position({
            my: "center",
            at: "center",
            of: $(this)
        });

        // Store a reference to the droppable in the draggable
        draggable.data("droppable", droppable);
        // Ensure the draggable stays visually on top
        draggable.css("z-index", 15); // Set a higher z-index to keep draggables above the droppable
    }
});




$(document).on("click", ".guessButton", function() {
    let correctAnswers = 0; // Initialize correctAnswers variable for this level

    // Iterate over each draggable that is visible to check for correctness
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
            $(".summaryList").append(`<li class="correct-item">${itemName}: Correct</li>`);
        } else {
            $(".summaryList").append(`<li class="incorrect-item">${itemName}: Incorrect</li>`);
        }
        
        // Ensure droppable is defined before attempting to append an overlay
        if (droppable) {
            // Add an overlay element to the droppable indicating correct/incorrect
            if (isMatched) {
                // Append a checkmark icon to the droppable area
                droppable.append('<div class="overlay checkmark"><i class="fas fa-check"></i></div>');
            } else {
                // Append a cross icon to the droppable area
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
   // Hide the guess button and show the next level button
$(".guessButton").hide();

// Ensure the next level button is visible
$(".nextLevel").show(); // Use jQuery's show() to ensure it's visible

// Debugging: Add a log to confirm the button's state
console.log("Next level button state after guess clicked:", $(".nextLevel").css("display"));
});
let currentLevel = 1; // Variable to track the current level


    // Function to start the timer
    function startTimer() {
        timeRemaining = 15; // Reset to 15 seconds for each game
        totalTime++
        $('.timerDisplay').text(`Time Left: ${timeRemaining}s`);

        countdownTimer = setInterval(function() {
            timeRemaining--;
            $('.timerDisplay').text(`Time Left: ${timeRemaining}s`);

            if (timeRemaining <= 0) {
                clearInterval(countdownTimer);
                autoGuess();
            }
        }, 1000);
    }

    // Function to automatically make a guess when time runs out
    function autoGuess() {
        $(".guessButton").click(); // Trigger guess logic
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

        // Hide elements for the current level
        currentLevelData.elementsToHide.forEach(element => {
            $(element).hide();
        });

        // Show elements for the current level
        currentLevelData.elementsToShow.forEach(element => {
            $(element).show();
        });
            // Reset only necessary elements for the next level (not needed for the end level)
    // If it's the end of the game, run the function to update the score
    if (currentLevelData.isEnd && typeof currentLevelData.showFinalScore === 'function') {
        currentLevelData.showFinalScore();
    } else {
        // If not end of game, reset level elements and show the guess button
        resetGame(resetLevels = true, resetScores = false, resetDraggables = true); // Reset game for next level without resetting current scores
        $("#guessButton").show(); // Ensure the guess button is shown for the next level
        $(".summaryContainer").removeClass("summaryGuessed");
    }

    clearInterval(countdownTimer); // Clear any existing timer
    startTimer(); // Start a new countdown timer

    // Log for debugging
    console.log("Current level:", currentLevel, "Elements to show:", currentLevelData.elementsToShow);
    }    
});

// Restart Game Button Click
$(".restart-btn").click(function() {
    saveGameData(); // Save game data when the game ends
    $(".resultBoard").hide(); // Hide the result board
    $(".resultDisplay").hide();
    resetFullGame(); // Reset the game
    $(".scoreDisplay").show();
    $(".game-title").show();
    $(".result-container").show();
    $(".summaryContainer").removeClass("summaryGuessed");
    $(".summaryList").empty();
    clearInterval(countdownTimer);
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


function resetFullGame() {
    resetGame();
    $(".flag-level2, .flag-level3").hide(); // Hide level 2 and 3 elements
    $(".game-container").show();            // Show level 1 elements
    $(".guessButton").show();               // Ensure the guess button is visible
    $(".nextLevel").hide();                 // Hide the next level button
    currentLevel = 1;          
    $(".scoreDisplay").text("Score: 0");          // Reset score
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

            // Reset position
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
            userName: userName,
            totalScore: totalScore,
            totalTime: totalTime,
            gameType: currentGameType // Save the current game type here
        };

        console.log("Saving game data:", gameData); // Debugging log for saving data

        // Check if there is already data in local storage
        let scoreboard = JSON.parse(localStorage.getItem('scoreboard')) || [];
        scoreboard.push(gameData);
        localStorage.setItem('scoreboard', JSON.stringify(scoreboard));

        console.log("Current Local Storage:", localStorage.getItem('scoreboard')); // Debugging log for stored data
    }

    // Display the scoreboard from local storage
    function displayScoreboard() {
        let scoreboard = JSON.parse(localStorage.getItem('scoreboard')) || [];
        let flagGameHtml = "<h3>Match The Flag Scores</h3>";
        let characterGameHtml = "<h3>Match The Characters Scores</h3>";
        let definitionGameHtml = "<h3>Match The Definition Scores</h3>";

        if (scoreboard.length === 0) {
        flagGameHtml += "<p>No scores recorded yet for Match The Flag.</p>";
        characterGameHtml += "<p>No scores recorded yet for Match The Characters.</p>";
        definitionGameHtml += "<p>No scores recorded yet for Match The Definition.</p>";
        } else {
            scoreboard.forEach(function(entry, index) {
            if (entry.gameType === 'flag') {
                flagGameHtml += `<div class="score-entry">
                    <span>Username: ${entry.userName}</span>,
                    <span>Final Score: ${entry.totalScore}</span>,
                    <span>Total Time: ${entry.totalTime}s</span>
                </div>`;
            } else if (entry.gameType === 'character') {
                characterGameHtml += `<div class="score-entry">
                    <span>Username: ${entry.userName}</span>,
                    <span>Final Score: ${entry.totalScore}</span>,
                    <span>Total Time: ${entry.totalTime}s</span>
                </div>`;
            } else if (entry.gameType === 'definition') {
                definitionGameHtml += `<div class="score-entry">
                    <span>Username: ${entry.userName}</span>,
                    <span>Final Score: ${entry.totalScore}</span>,
                    <span>Total Time: ${entry.totalTime}s</span>
                </div>`;
                  
                ;
            }});
        }

        $("#scoreboard-content").html(
            `<div class="scoreboard-column">${flagGameHtml}</div>
             <div class="scoreboard-column">${characterGameHtml}</div>
             <div class="scoreboard-column">${definitionGameHtml}</div>`
        );
    };



//FIXME - equation? Instead of definition maybe do an equation based guess? 

// equation / equation / equation / equation 
//                                       = 4   - equation dragged and dropped before equals sign?

//FIXME - WORDLE?????? - Instead of definition or equation maybe do WORDLE??????????