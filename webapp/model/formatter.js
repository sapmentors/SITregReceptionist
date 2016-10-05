sap.ui.define([
	], function () {
		"use strict";
		return {
			/**
			 * convert Preevening and Posteveningevent value 
			 * Y --> Yes
			 * N --> No
			 * M --> Maybe
			 * W --> Waiting liest
			 * @public
			 * @param {string} sValue value to be formatted
			 * @returns {string} true or false
			 */
			eventValue : function (sValue) {
				var oResourceBundle = this.getModel("i18n").getResourceBundle();
				var sResult = "";
				
				if (sValue === "Y") {
					sResult = "yes";
				}
				else if(sValue === "N"){
					sResult = "no";
				}
				else if(sValue === "M" || sValue === null){
					sResult = "maybe";
				}
				else if(sValue === "W"){
					sResult = "waitinglist";
				}
				return oResourceBundle.getText(sResult);

			},
			/**
			 * Rounds the currency value to 2 digits
			 *
			 * @public
			 * @param {string} sValue value to be formatted
			 * @returns {string} formatted currency value with 2 digits
			 */
			currencyValue : function (sValue) {
				if (!sValue) {
					return "";
				}

				return parseFloat(sValue).toFixed(2);
			}
		
		};

	}
);