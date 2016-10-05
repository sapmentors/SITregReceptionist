sap.ui.define([
	], function () {
		"use strict";


		return {
			/**
			 * Return the Registration Numbers for the Event
			 *
			 * @public
			 * @param {int} iMaxParticipants Number of maximum participants
			 * @param {int} iParticipants Number of current participants
			 * @param {int} iFree Number of free places
			 * @returns {string} Registration Numbers
			 */
			registrationNumbers : function (iMaxParticipants, iParticipants, iFree) {
				if(iMaxParticipants !== null) {
			    	var oResourceBundle = this.getModel("i18n").getResourceBundle();
			    	return oResourceBundle.getText("masterRegistrationNumbers", [iFree, iParticipants, iMaxParticipants]);
				}
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