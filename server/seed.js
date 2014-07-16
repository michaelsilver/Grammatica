verbsByType =
    {
        'irregular':
        [
         'avoir',
         '\352tre', // \352 = ê, so être
         'faire',
         'aller',
         'venir',
         'voir',
         'savoir',
         'conna\356tre' // \356 = î, so connaître
        ],
        'er': //from https://conjuguemos.com
        [
            'accompagner',
            'aider',
            'apporter',
            'chanter',
            'co\373ter', // \373 = û, so coûter
            'danser',
            'fermer',
            'jouer',
            'laver',
            'marcher',
            'montrer',
            'oublier',
            'passer',
            'penser',
            'pr\351parer', // \351 = é, so préparer
            'raconter',
            '\351couter', // \351 = é, so écouter
            '\351tudier', // \351 = é, so étudier
            // verbs from conjuguemos end here
            'travailler',
            'manger',
            'dessiner',
            'regarder',
            'parler',
            'téléphoner'
        ],
        're': //from https://conjuguemos.com
        [
            'attendre',
            'descendre',
            'd\351fendre', // \351 = é, so défendre
            'entendre',
            'interrompre',
            'perdre',
            'rendre',
            'rompre',
            'r\351pondre', // \351 = é, so répondre
            'vendre',
            // verbs from conjuguemos end here
            // 'lire' // Is this a -re verb????
        ],
        'ir': //from https://conjuguemos.com
        [
            'agir',
            'b\342tir', // \342 = â, so bâtir
            'choisir',
            'd\351sob\351ir', // \351 = é, so désobéir
            'finir',
            'gu\351rir', // \351 = é, so guérir
            'nourrir',
            'ob\351ir', // \351 = é, so obéir
            'punir',
            'remplir',
            'rougir',
            'r\351fl\351chir', // \351 = é, so réfléchir
            'r\351ussir', // \351 = é, so réussir
            'saisir',
            // verbs from conjuguemos end here
            'grossir',
            'maigrir',
            'grandir'
        ],
        'ger': //from https://conjuguemos.com
        [
            'manger',
            'changer',
            'corriger',
            'diriger',
            'nager',
            'obliger',
            'voyager'
        ],
        'cer': //from https://conjuguemos.com
        [
            'commencer',
            'annoncer',
            'avancer',
            'effacer',
            'lancer',
            'menacer',
            'placer',
            'prononcer',
            'renoncer'
        ],
        '\351AccentChangingEr':
        [
            'pr\351f\351rer', // préfére
            'esp\351rer', // espérer
            'r\351p\351ter' // répéter
        ],
        'eAccentChangingEr':
        [
            'acheter',
            'amener',
            'emmener',
            'lever',
            'promener'
        ]
    };

if (Verbs.find().count() === 0) {
	_.each(verbsByType, function(verbs, type) {
        _.each(verbs, function(verb){
            Verbs.insert({
                'type': type,
                'verb': verb
            });
        });
	});
}