// Comments are above the syntax they describe (unless they are on the same line as syntax)

// Makes a given web page element updatable (unique to Meteor)
// We have multiple web page elements, so instead declaring them as updatable individually,
// we created a function to reduce redundancy.
// function accepts two inputs:
// the variable "template" is found in HTML <template name="whatever">
// NOTE: template has to be input into the function as "Template.whatever" see below calls to this function.
//"varName" is found in the HTML between the brackets: {{this would be the varName}}
function exposeSessionVar(template, varName){
	template[varName] = function(){
		return Session.get(varName);
	};
}
// templates and session variables are unique to Meteor. 
// They allow us to refer to HTML elements as if they were variables. 
// Any updates to that HTML (variable) will be updated on the site instantaneously


// UTILITY: Function to pick a random element from an array of any size.
// Function given the array as an argument.
function pickRandomFromArray(array){
	return array[Math.floor(Math.random() * array.length)];
}

// Global variable -- needed for some of the functions below
var pronouns =   ['je', 'tu', 'il/elle/on', 'nous', 'vous', 'ils/elles'];

// UTILITY: When this function is given 'il' for example, the function will return the 
// so-called "type" of the pronoun which for 'il' is 'il/elle/on'
// This function is necessary because the database does not know 'il' but does know 'il/elle/on'
// similarly, the function does not know 'ils' but does know 'ils/elles'
// If given a pronoun like 'nous' that does not have any slashes, it will return the original 'nous'
function getTypeOfPronoun(pronoun){
	var ret;
	_.each(pronouns, function(candidate){
		if(_.contains(candidate.split(/\//g), pronoun)){ //splits string by slashes (/)
			ret = candidate;
		}
	});
	return ret;
}

// Makes these web page elements updatable. Calls above defined function.
exposeSessionVar(Template.main, 'userPronoun');
exposeSessionVar(Template.main, 'userVerb');
exposeSessionVar(Template.main, 'userCorrect');
exposeSessionVar(Template.main, 'theActualAnswer');


// On web page load, shows a random case, number, and noun.
function promptUser(){
	if(Verbs.find().count() === 0){
		window.setTimeout(promptUser, 100); //waits for a little - otherwise program gets ahead of itself
		return;
	}

	// clears everything but the prompts
	$('#userInput').val('');
	Session.set('theActualAnswer', '');
	Session.set('userCorrect', '');

	// picks a pronoun and verb; saves both of them to variables
	var promptedPronoun = pickPronoun();
	var promptedVerb = pickVerb();

	// while the picked pronouns and verbs (not yet prompted) are exactly the same as the 
	// previously prompted ones, the program re-chooses the pronoun and verb
	while (promptedPronoun === getPronoun() && promptedVerb === getVerb()){
		promptedPronoun = pickPronoun();
		promptedVerb = pickVerb();
	}

	// finally, updates the web page with the picked prompts
	setPrompts(
		promptedPronoun,
		promptedVerb
	);
}

// Function to update the web page with the provided pronoun + verb. 
// Uses session variables; sets the pronoun and verb variables to the picked pronoun + verb.
function setPrompts(pronoun, verb){
	Session.set('userPronoun', pronoun);
	Session.set('userVerb', verb);
}

function pickPronoun(){
	var pickedPronouns = pickRandomFromArray(pronouns);
	pickedPronouns = pickedPronouns.split(/\//g);
	return pickRandomFromArray(pickedPronouns);
}

function verbTypes(){
	if(Verbs.find().count() == 0){
		return [];
	}else{
		return _.uniq(_.pluck(Verbs.find().fetch(), 'type'));
	}
}

Template.main.helpers({
	verbtypes: verbTypes
});

Template.menu.helpers({
	verbtypes: verbTypes
});

function pickVerb(){ // eventually accept choices
	var typeOfPromptedVerb = pickRandomFromArray(verbTypes());
	var verbsOfType = _.where(Verbs.find().fetch(),{type:typeOfPromptedVerb});
	return {
		verb:pickRandomFromArray(_.pluck(verbsOfType,'verb')),
		type:typeOfPromptedVerb
	};
}
Meteor.startup(function(){
	promptUser();
});

Template.main.events({
	'click #submit':function(){
		handleSubmit();
	},
	'keypress input': function (evt) {
		Session.set('userCorrect', '');
		if (evt.which === 13) {
			handleSubmit();
		}
	}
});

function getPronoun(){
	if(Session.get('userPronoun')){
		return Session.get('userPronoun').toLowerCase();
	} else {
		return undefined;
	}
}

function getVerb(){
	if(Session.get('userVerb')){
		var ret = Session.get('userVerb');
		ret.verb = ret.verb.toLowerCase();
		return ret;
	}else{
		return undefined;
	}
}

function handleSubmit(){
	var answer = $('#userInput').val().toLowerCase();
	answer = answer.replace(/\s+/g, ' ');
	answer = answer.replace(/^\s*/, '');
	answer = answer.replace(/\s*$/, '');
	if (answer == (correctAnswer(getPronoun(), getVerb()))) {
		promptUser();
	} else {
		Session.set('userCorrect', 'WRONG!');
		Session.set('theActualAnswer', correctAnswer(getPronoun(), getVerb()));
	}
}

function correctAnswer(pronoun, verb){
	var stem;
	var typeOfPromptedPronoun = getTypeOfPronoun(pronoun);
	// Check this logic:
	if (verb.type == 'irregular'){
		stem = '';
	} else if (verb.type === '\351AccentChangingEr' || verb.type === 'eAccentChangingEr'){
		stem = verb.verb.slice(0, verb.verb.lastIndexOf('er'));
		stem = changeEAccent(verb.type, stem, typeOfPromptedPronoun);
		verb.verb = 'er';
	} else {
		stem = verb.verb.slice(0, verb.verb.lastIndexOf(verb.type));
		verb.verb = verb.type;
	}
	// Stop checking here.
	if (pronoun == 'je' && firstLetterIsVowel(stem + verbConjugation[verb.verb][typeOfPromptedPronoun])){
		return "j'" + stem + verbConjugation[verb.verb][typeOfPromptedPronoun];
	} else return pronoun + ' ' + stem + verbConjugation[verb.verb][typeOfPromptedPronoun];
}

function changeEAccent(type, stem, pronoun){
	return replaceCharAt(stem.length-2, stem, verbConjugation[type][pronoun]);
}

// UTILITIES:

function firstLetterIsVowel(word){
	return (/[aeiou]/).test(word.charAt(0));
}

function replaceCharAt(index, str, character){
	return str.substr(0, index) + character + str.substr(index + 1);
}