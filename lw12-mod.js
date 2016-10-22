var net = require('net');

module.exports = function (ip, port) {
    var module = {};

	module.ip = ip;
	module.port = port;

	module.state = {
		power : false,
		hue : 100,
		brightness : 100,
		saturation : 100,
	}

    module.getPowerState = function () {
		return module.state.power;
	}

    module.setPowerState = function (state, callback) {
		var onMessage = '7e040401ffffff00ef';
		var offMessage = '7e04040000ffff00ef';
		sendHexString(state ? onMessage : offMessage, function(success) {
			if (success) {
				module.state.power = state;
			}
			callback(success)
		});
    };

	module.getBrightness = function() {
		return module.state.brightness;
	}

	module.setBrightness = function (value, callback) {
		var brightnessMessage = "7e0401" + decimalToHex(value, 2) + "ffffff00ef";
		sendHexString(brightnessMessage, function(success) {
			if (success) {
				module.state.brightness = value;
			}
			callback(success)
		});
    };

	module.getHue = function() {
		return module.state.hue;
	}

	module.setHue = function (value, callback) {
		var rgb = hsb2rgb(value, module.state.saturation, 100);
		setColor(rgb.r, rgb.g, rgb.b, function(result) {
			if (result) {
				module.state.hue = value;
			}
			callback(result);
		});
    };

	module.getSaturation = function() {
		return module.state.saturation;
	}

	module.setSaturation = function (value, callback) {
		var rgb = hsb2rgb(module.state.hue, value, 100);
		setColor(rgb.r, rgb.g, rgb.b, function(result) {
			if (result) {
				module.state.saturation = value;
			}
			callback(result);
		});
    };

	function decimalToHex(d, padding) {
		var hex = Number(d).toString(16);
		padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;
		while (hex.length < padding) {
			hex = "0" + hex;
		}
		return hex;
	}

	function setColor(red, green, blue, callback) {
		console.log("setting color to " + red + " : " + green + " : " + blue + "");

		var hexString = '7e070503' + decimalToHex(red, 2) + decimalToHex(green, 2) + decimalToHex(blue, 2) + '00ef';
		sendHexString(hexString, function(success) {
			callback(success)
		});
	}

    function sendHexString(hexMessage, callback) {
		var message = new Buffer(hexMessage, 'hex');

        var client = new net.Socket();
        client.connect(module.port, module.ip, function() {
        	console.log('Message ' + hexMessage + ' sent to ' + module.ip +':'+ module.port);
        	client.write(message);
        });

        client.on('data', function(data) {
        	console.log('Received: ' + data);
        	client.destroy(); // kill client after server's response
        });

    };

	/**
     * Converts an HSB color value to RGB. Conversion formula
     * adapted from http://stackoverflow.com/a/17243070/2061684
     * Assumes h in [0..360], and s and l in [0..100] and
     * returns r, g, and b in [0..255].
     *
     * @param   {Number}  h       The hue
     * @param   {Number}  s       The saturation
     * @param   {Number}  l       The lightness
     * @return  {Array}           The RGB representation
     */
    function hsb2rgb (h, s, v) {
        var r, g, b, i, f, p, q, t;

        h /= 360;
        s /= 100;
        v /= 100;

        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
        var rgb = { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
        return rgb;
    }

    return module;
};
/*
module.exports = {

    setState: function (ip, state, callback) {
        console.log("--- " + ip + ": " + state)
		callback(true);
    }
};*/
