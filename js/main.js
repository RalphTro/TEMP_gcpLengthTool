$(document).ready(function () {
	// when document loaded:
	$.getJSON('gcp_data/gcpprefixformatlist.json', function (gs1Data) {
		var fullDate = new Date(gs1Data.GCPPrefixFormatList.date);
		var date = fullDate.toISOString().substring(0, 10);
		console.log(date);
		$("#gs1-updated").html(date);
	});

	$.getJSON('gcp_data/additionalgcpdata.json', function (ownData) {
		var fullDate = new Date(ownData.GCPPrefixFormatList.date);
		var date = fullDate.toISOString().substring(0, 10);
		console.log(date);
		$("#own-updated").html(date);
	});

	// Regular expressions for GS1 keys
	const gs1KeyRegEx = {
		'00': /^(\d{18})$/,
		'01': /^(\d{14})$/,
		'253': /^(\d{13})([\x21-\x22\x25-\x2F\x30-\x39\x3A-\x3F\x41-\x5A\x5F\x61-\x7A]{0,17})$/,
		'255': /^(\d{13})(\d{0,12})$/,
		'401': /^([\x21-\x22\x25-\x2F\x30-\x39\x3A-\x3F\x41-\x5A\x5F\x61-\x7A]{0,30})$/,
		'402': /^(\d{17})$/,
		'414': /^(\d{13})$/,
		'417': /^(\d{13})$/,
		'8003': /^(\d{14})([\x21-\x22\x25-\x2F\x30-\x39\x3A-\x3F\x41-\x5A\x5F\x61-\x7A]{0,16})$/,
		'8004': /^([\x21-\x22\x25-\x2F\x30-\x39\x3A-\x3F\x41-\x5A\x5F\x61-\x7A]{0,30})$/,
		'8006': /^(\d{14})(\d{2})(\d{2})$/,
		'8010': /^([\x23\x2D\x2F\x30-\x39\x41-\x5A]{0,30})$/,
		'8017': /^(\d{18})$/,
		'8018': /^(\d{18})$/
	};

	// Key starts with GCP
	const keyStartsWithGCP = {
		'00': false,
		'01': false,
		'253': true,
		'255': true,
		'401': true,
		'402': true,
		'414': true,
		'417': true,
		'8003': false,
		'8004': true,
		'8006': false,
		'8010': true,
		'8017': true,
		'8018': true
	};

	// Load GCP Length Table data from local JSON file
	fetch('gcp_data/gcpprefixformatlist.json')
		.then(response => response.json())
		.then(allGCPs => {
			// Transform JSON structure into list of dictionaries
			const gcpDict = allGCPs.GCPPrefixFormatList.entry;

			function getGCPLength(aI, gs1Key) {
				// Check if GS1 Key complies with its corresponding RegEx
				if (!gs1KeyRegEx[aI].test(gs1Key)) {
					throw new Error('The GS1 Key has an incorrect length or impermissible characters.');
				}

				// Variables storing identified gcp length and specifying prefix length/search string
				let gcpLength = "";
				let j = 12;

				// Normalize input string so that function works consistently for all GS1 keys
				if (keyStartsWithGCP[aI]) {
					gs1Key = '0' + gs1Key;
				}

				// Check if there are matching 12-digit prefix values.
				// If not, iterate further (i.e. decrease GCP length) until there is a match.
				// Then, return corresponding GCP Length Value
				while (j > 2 && !gcpLength) {
					for (let i = 0; i < gcpDict.length; i++) {
						if (gcpDict[i].prefix.length === j && gs1Key.substring(1, j + 1).includes(gcpDict[i].prefix)) {
							gcpLength = gcpDict[i].gcpLength;
							return gcpLength;
						}
					}
					j -= 1;
				}

				if (!gcpLength) {
					throw new Error('There is no matching value. Try Verified by GS1 (https://www.gs1.org/services/verified-by-gs1) or contact local GS1 MO.');
				}
			}

			// Example usage
			try {
				const gcpLength = getGCPLength('01', '04012345123456');
				console.log('GCP Length:', gcpLength);
			} catch (error) {
				console.error(error.message);
			}
		})
		.catch(error => console.error('Error loading JSON file:', error));

	$("#input").on("mousedown", function () {
		$("#input").css("background-color", "yellow");
	});

	$("#get-gcp").on("click", function () {
		console.log($("#dropdown").val());
		console.log($("#input").val());
		$("#output").val(getGCPLength($("#dropdown").val(),$("#input").val()));
	});

	$("#clear").on("mousedown", function () {
		$("#dropdown").val('');
		$("#input").val('');
	});

	$("#gtin").on("click", function () {
		$("#input").val('04150999999994');
		$("#dropdown").val('01');
	});

	$("#sscc").on("click", function () {
		$("#input").val('340123453111111115');
		$("#dropdown").val('00');
	});

	$("#gln").on("click", function () {
		$("#input").val('4280000000002');
		$("#dropdown").val('417');
	});

	$("#giai").on("click", function () {
		$("#input").val('0425121832999XYZ');
		$("#dropdown").val('8004');
	});

});