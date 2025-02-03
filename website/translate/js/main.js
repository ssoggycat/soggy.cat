const SOG = ["Soggy", "Sog", "Bath", "Cat", "🐱🛁", "Shark", "Sogger", "🐱💧", "Sogging", "Ceasar"];
/*
for base < 7, emoji might not work
or it'll require a rewrite of the sign encode_count at the start
please check unicode table to see if the emoji requires less than 7 values to be encoded
*/ 
const SOG_BASE = 10;

function max_byte(to_sog)
{
	/*
		args : 
			to_sog : String : string to convert
		returns :
			maxCode : int : amount of values needed to encode the biggest character in the string
		get the amount of values needed to encode the biggest character in the string
	*/
	let maxCode = 0;

	for (const char of to_sog)
	{
		const codePoint = char.codePointAt(0);
		if (codePoint > maxCode)
			maxCode = codePoint;
	}
	return maxCode.toString().length;
}

function base_to_sog(to_sog)
{
	/*
		args :
			to_sog : String : string to convert
		returns :
			sog_result : String : converted string to SOG encoding
		convert a string to SOG encoding
	*/
	var sog_result = "";
	var encode_count = (max_byte(to_sog)) % SOG_BASE;

	// Add the encode count to the beginning of the string to further decode it
	sog_result = SOG[encode_count - 1] + " ";
	for (const char of to_sog)
	{
		const codePoint = char.codePointAt(0);
		const sog_code = codePoint.toString(SOG_BASE);
		if (sog_code.length < encode_count) // leading zeros
			sog_result += (SOG[0] + " ").repeat(encode_count - sog_code.length);
		for (const digit of sog_code) // num in SOG_BASE converted to SOG
			sog_result += SOG[digit] + " ";
	}
	return sog_result;
}

function sog()
{
	/*
		args : none
		returns : none
		Handle SOG encoding, 
		replace the TextArea value with the encoded string,
		and copy it to the clipboard
	*/
	var to_sog_elem = document.getElementById("to_sog");
	var to_sog = to_sog_elem.value;
	var sog_result = base_to_sog(to_sog);
	// Remove the last space
	sog_result = sog_result.slice(0, -1);
	to_sog_elem.value = sog_result;
	navigator.clipboard.writeText(sog_result);
}

function sog_to_dec(sog_chars, i, encode_count)
{
	/*
		args :
			sog_chars : Array : array of SOG characters
			i : int : index of the first character to convert
			encode_count : int : amount of characters to convert
		returns :
			sog_code : int : converted SOG character to decimal
		convert SOG characters to decimal
	*/
	var sog_code = 0;
	for (var j = 0; j < encode_count; j++)
	{
		var sog_index = SOG.indexOf(sog_chars[i + j]);
		if (sog_index == -1)
			return -1;
		sog_code *= SOG_BASE;
		sog_code += sog_index;
	}
	return sog_code;
}

function unsog()
{
	/*
		args : none
		returns : none
		Handle SOG decoding,
		replace the TextArea value with the decoded string
	*/
	var to_unsog_elem = document.getElementById("to_sog");
	var to_unsog = to_unsog_elem.value;
	var unsog_result = "";
	var encode_count = 0;

	var sog_chars = to_unsog.split(" ");
	encode_count = SOG.indexOf(sog_chars[0]) + 1;
	if (!encode_count)
	{
		alert("Invalid SOG encoding");
		return;
	}
	sog_chars.shift(); // remove the encode count
	if (sog_chars.length % encode_count != 0)
	{
		alert("SOG header doesn't match the encoding count");
		return;
	}
	for (var i = 0; i < sog_chars.length; i += encode_count)
	{
		var sog_code = sog_to_dec(sog_chars, i, encode_count);
		if (sog_code == -1)
		{
			alert("Encountered an invalid SOG value");
			return;
		}
		unsog_result += String.fromCodePoint(sog_code);
	}
	to_unsog_elem.value = unsog_result;
}

function clear_text()
{
	/*
		args : none
		returns : none
		Clear the TextArea value
	*/
	document.getElementById("to_sog").value = "";
}
