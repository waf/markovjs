/*
 * Markov generator. There are two public methods:
 *  loadText - called first with a large body of text.
 *  generateWords - generate text that is similar to the text passed into loadText
 */
function MarkovGenerator(settings) {
	var that = this;
	var frequencyTable = {};
	var frequencyTableLength = 0;
	var lookaheadLength = settings.chainLength || 3;
	var initialized = false;

	// Take a body of text and build up a frequency table.
	that.loadText = function(text) {
		var parsed_text = text.split(" ");
		var key; // the current key of the frequencyTable, this will be a 'sliding window' of length `lookaheadLength` across the text
		var posttext; // the text that comes after `key`. Each posttext is associated with a frequency: how often it occurs after `key`

		for(var i = 0; i < parsed_text.length; i++) {
			key = parsed_text.slice(i,i+lookaheadLength).join(" ");
			if(!frequencyTable[key]) {
				frequencyTable[key] = {};
				frequencyTableLength++;
			}
			posttext = parsed_text.slice(i+lookaheadLength,i+2*lookaheadLength).join(" ");
			if(!frequencyTable[key][posttext])
				frequencyTable[key][posttext] = 0;
			frequencyTable[key][posttext]++;
		}
		initialized = true;
	}

	// use the frequency table built up in loadText to generate up to `count` words
	that.generateWords = function(count) {
		if(!initialized)
			throw new Error("Not initialized - loadText has not been called");

		var currentKey = getRandomProperty(frequencyTable); //start off with a random key, so we don't always generate the same text
		var wordstring = currentKey; //wordstring accumulates the text we're generating
		var newKey;

		for(var i = 0; i < count/lookaheadLength; i++) {
			newKey = chooseWeightedValue(frequencyTable[currentKey]);
			if(!newKey) {
				return wordstring;
			}
			wordstring += " " + newKey;
			currentKey = newKey;
		}

		return wordstring;
	}

	// helper method - given an object (dictionary), return a random property (key) of that object
	function getRandomProperty(obj) {
		var pos = 0,
			randomPos = Math.floor(Math.random() * frequencyTableLength);

		for (var prop in obj) {
			if(prop) {
				if (pos === randomPos) {
					return prop;
				}
				pos++;
			}
		}  
	}

	// given a dictionary mapping strings to how often they occur, 
	//  randomly choose one of the strings, giving more weight to
	//  strings that occurred more often.
	function chooseWeightedValue(values) {
		var total = 0,
			random,
			frequncy;

		for(var value in values) {
			if(value) {
				frequency = values[value];
				total += frequency;
			}
		}

		random = Math.floor(Math.random()*total);

		for(var value in values) {
			if(value) {
				frequency = values[value];
				if(random <= frequency) {
					return value;
				}
				random -= frequency;
			}
		}
	}

	return that;
}
