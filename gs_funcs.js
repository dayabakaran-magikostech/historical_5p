require("https");
var request = require("request");

exports.readData = (s_name, filters, url) => {
	const options = {
		url: url,
		followAllRedirects: true,
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		// form:json
		json: {
			type: "read",
			s_name: s_name,
			filters: filters,
		},
	};

	return new Promise(function (resolve, reject) {
		request(options, function (err, res, body) {
			if (res && (res.statusCode === 200 || res.statusCode === 201)) {
				resolve(body.response_data);
			} else {
				console.log(err);
				reject(false);
			}
		});
	});
};