function exposeSessionVar(template, varName){
	template[varName] = function(){
		return Session.get(varName);
	};
}
// make a gien webpage element updatable

// pick a random element of an array
function pickRandomFromArray(array){
	return array[Math.floor(Math.random() * array.length)];
}

var pronouns =   ['je', 'tu', 'il/elle/on', 'nous', 'vous', 'ils/elles'];
function getTypeOfPronoun(pronoun){
	var ret;
	_.each(pronouns, function(candidate){
		if(_.contains(candidate.split(/\//g), pronoun)){
			ret = candidate;
		}
	});
	return ret;
}
// makes these webpage elements updatable
exposeSessionVar(Template.main, 'userPronoun');
exposeSessionVar(Template.main, 'userVerb');
exposeSessionVar(Template.main, 'userCorrect');
exposeSessionVar(Template.main, 'theActualAnswer');


// on webpage load, show a random case, number, and noun

function promptUser(){
	if(Verbs.find().count() === 0){
		window.setTimeout(promptUser, 100);
		return;
	}
	$('#userInput').val('');
	Session.set('theActualAnswer', '');
	Session.set('userCorrect', '');
	// clears everything but the prompts

	var promptedPronoun = pickPronoun();
	var promptedVerb = pickVerb();

	while (promptedPronoun === getPronoun() && promptedVerb === getVerb()){
		promptedPronoun = pickPronoun();
		promptedVerb = pickVerb();
		// console.log("I fixed myself!");
	}

	setPrompts(
		promptedPronoun,
		promptedVerb
	);
}

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