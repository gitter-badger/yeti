'use strict';

var inq = require('inquirer');

var questions = [
    {
        type: 'input',
        name: 'username',
        message: 'What user name do you want to use?',
        validate: function(answer) {
            if (answer.length < 5) {
                return 'You must enter a valid username';
            }
            return true;
        }
    },
    {
        type: 'password',
        name: 'password',
        message: 'Please enter a password\n (Password must be 8 characters with at least 1 number and 1 special character)\n',
        validate: function(answer) {
            if (!answer.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/)) {
                return 'Password must be 8 characters with at least 1 number and 1 special character'
            }
            return true;
        }
    },
    {
        type: 'checkbox',
        name: 'checkbox_test',
        message: 'Checkbox Test',
        choices: [
            new inq.Separator('First Choices:'),
            {
                name: 'First'
            },
            {
                name: 'Second'
            },
            {
                name: 'Third'
            }
        ],
        validate: function(answer) {
            if (answer.length < 1) {
                return 'You must choose at least one.';
            }
            return true;
        }
    },
    {
        type: 'confirm',
        name: 'test_confirm',
        message: 'Test Confirm'
    }
];

inq.prompt(questions, function(answers) {
    console.log(JSON.stringify(answers));
});