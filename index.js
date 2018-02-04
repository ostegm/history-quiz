'use strict'

$(function () {

  const TEMPLATES = {
    questionTemplate: Handlebars.compile(document.getElementById('questionTemplate').innerHTML),
  };

  const QUESTIONS = _.shuffle(originalQuestions);
  const incorrectColor = '#EA4335';
  const correctColor = '#34A853';
  const notSelectedColor = '#9AA0A6';

  const STORE = {
    currentQuestion: 0,
    state: 'start',
    correct: 0,
  };

  function checkAnswer() {
    // Evaluate the selected answer against the data store. If the answer is
    // correct, increment the counter and return True. Otherwise return false.
    const selected = $('input[name=q1]:checked').val();
    const correct = QUESTIONS[STORE.currentQuestion].correctAnswer;
    const result = (selected === correct);
    STORE.correct += result;
    return result;
  }

  function showCorrect(selectedCorrectly) {
    // Modify the background color of the answers to indicate green for a correct
    // answer, red for an incorrect answer, and grey for all other choices.
    // Additionally, show some text next to the answes indicating correct answers.
    if (selectedCorrectly === true) {
      $('input[name=q1]').parent().css('background-color', notSelectedColor);
      $('input[name=q1]:checked').parent().css('background-color', correctColor);
      $('input[name=q1]:checked')
        .parent()
        .append('<span class="answer-indicator">You got it correct!</span');

    } else {
      const correctAnswer = QUESTIONS[STORE.currentQuestion].correctAnswer;
      $('input[name=q1]').parent().css('background-color', notSelectedColor);
      $('input[name=q1]:checked').parent().css('background-color', incorrectColor);
      $('input[name=q1]:checked')
        .parent()
        .append(`<span class="answer-indicator">Sorry, that's incorrect. The correct answer was "${correctAnswer}"</span>`);
      $('input[name=q1][correct=true]').parent().css('background-color', correctColor);
    }
  }

  function generateQuestionTemplate(question) {
    // Shuffles the answers and generates the HTML for a radio button form
    // question.
    const shuffledAnswers =  _.shuffle(question.answers);
    const correctList = shuffledAnswers.map(a => a === question.correctAnswer);
    const data = {
      questionText: question.Text,
      shuffledAnswers: shuffledAnswers,
      correctList: correctList
    }
    return TEMPLATES.questionTemplate(data);
  }

  function getNavButton() {
    // Helper function which returns a different button based on the app's current
    // state. Options are "Next question", "Submit answer" and "Try Again".
    if (STORE.state === 'submitted') {
      return '<button class="js-next-question" type="button">Next Question</button>';
    } else if (STORE.state === 'question') {
      return '<button class="js-submit-answer" type="button">Submit Answer</button>';
    } else if (STORE.state === 'results') {
      return '<button class="js-reset-quiz" type="button">Try Again</button>';
    } else {
      return null;
    }

  }

  function generateHeaderResultsTemplate() {
    // Populates the HTML used to display the user's progress in the header bar.
    const qText = `${STORE.currentQuestion + 1} / ${QUESTIONS.length}`;
    const correctText = `Score: ${STORE.correct}`;
    const resultsHtml = `
        <h1 class="col-3">History Quiz</h1>
        <ul>
          <li>Question ${qText}</li>
          <li>${correctText}</li>
        </ul>
    `;
    return resultsHtml;
  }

  function generateQuizNavTemplate() {
    // Function to create the HTML used below the form for navigation.
    return `<div class="col-12 quiz-nav-item">${getNavButton()}</div>`;
  }

  function generateResultsTemplate() {
    // Generates the contents of a results pop out modal.
    return `
    <div class="modal-content">
      <span>Thanks for playing, you got ${STORE.correct} questions right.<br><br>
      <a href="">Try again?</a></span>
      <span class="js-close-modal">&times;</span>
    </div>
    `;
  }

  function renderQuestion() {
    // When called, sets the current state to question and generates all html
    // elements necessary to show the next question.
    STORE.state = 'question';
    const question = QUESTIONS[STORE.currentQuestion];
    const questionHtml = generateQuestionTemplate(question);
    const navHtml = generateQuizNavTemplate();
    const resultsHtml = generateHeaderResultsTemplate();
    $('.question-container').html(questionHtml);
    $('.quiz-nav').html(navHtml);
    $('.header-bar').html(resultsHtml);
  }

  function handleStartButtonClicked() {
    // Once the user begins the quiz, hides a start button and renders the first
    // question.
    $('.js-start-quiz').click(event => {
      $('.quiz-nav').toggleClass('hidden');
      $('.starting-container').toggleClass('hidden');
      $('.question-container').toggleClass('hidden');
      renderQuestion();
    });
  }

  function showResultsModal() {
    // Generates the HTML for a modal and displays it to the user. Also kicks off
    // an event listener to allow the user to close the modal.
    const resultsHtml = generateResultsTemplate();
    const modal = $('.js-results-modal');
    modal.html(resultsHtml);
    modal.toggleClass('hidden');
    handleModalInteractions();
  };

  function handleModalInteractions() {
    // Listens for a close modal event.
    $('.js-results-modal').on('click', '.js-close-modal', event => {
        $('.js-results-modal').toggleClass('hidden');
      });
  }

  function handleResetButtonClicked() {
    // Listens for a click on a reset quiz button.
    $('.quiz-nav').on('click', '.js-reset-quiz', event => {
      location.reload();
    });
  }

  function handleQuestionSubmit() {
    // Handles error checking and determines the appropriate content to display
    // based on current app state.
    $('.quiz-nav').on('click', '.js-submit-answer', event => {
      if ($('input').is(':checked') === false) {
        alert('Please select an answer.');
        return;
      } else if (STORE.currentQuestion + 1 < QUESTIONS.length) {
        STORE.state = 'submitted';
      } else {
        STORE.state = 'results';
        showResultsModal();
      }

      const selectedCorrectly = checkAnswer();
      const resultsHtml = generateHeaderResultsTemplate();
      const nav = generateQuizNavTemplate();
      $('.quiz-nav').html(nav);
      $('.header-bar').html(resultsHtml);
      showCorrect(selectedCorrectly);
    });
  }

  function handleNextQuestionClicked() {
    $('.quiz-nav').on('click', '.js-next-question',  event => {
        STORE.currentQuestion++;
        renderQuestion();
      });
  }

  handleStartButtonClicked();
  handleQuestionSubmit();
  handleNextQuestionClicked();
  handleResetButtonClicked();

});
