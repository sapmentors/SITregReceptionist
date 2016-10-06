/*global location */
sap.ui.define([
		"com/sap/sapmentors/sitreg/receptionist/controller/BaseController",
		"sap/m/MessageToast",
		"sap/ui/model/json/JSONModel",
		"com/sap/sapmentors/sitreg/receptionist/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	], function (BaseController, MessageToast, JSONModel, formatter, Filter, FilterOperator) {
		"use strict";

		return BaseController.extend("com.sap.sapmentors.sitreg.receptionist.controller.Detail", {
 
			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			onInit : function () {
				// Model used to manipulate control states. The chosen values make sure,
				// detail page is busy indication immediately so there is no break in
				// between the busy indication for loading the view's meta data
				var oViewModel = new JSONModel({
					busy : false,
					delay : 0,
					lineItemListTitle : this.getResourceBundle().getText("detailLineItemTableHeading")
				});
				
				var oTable = this.byId("lineItemsList");
				this._oTable = oTable;
				this._oTableSearchState = [];
				
				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

				this.setModel(oViewModel, "detailView");

				this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
			},
			
		
			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */
			onSearch : function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					// Search field's 'refresh' button has been pressed.
					// This is visible if you select any master list item.
					// In this case no new search is triggered, we only
					// refresh the list binding.
					this.onRefresh();
				} else {
					var oTableSearchState = [];
					var sQuery = oEvent.getParameter("query");

					if (sQuery && sQuery.length > 0) {
						oTableSearchState = [new Filter("tolower(FirstName)", FilterOperator.Contains, "'" + sQuery.toLowerCase() + "'")];
					}
					this._applySearch(oTableSearchState);
				}

			},


			/**
			 * Event handler for refresh event. Keeps filter, sort
			 * and group settings and refreshes the list binding.
			 * @public
			 */
			onRefresh : function (oEvent) {
				var oPullToRefresh = this.byId("pullToRefresh");
				oPullToRefresh.hide();
				this._oTable.getBinding("items").refresh();
				
			},
						/**
			 * Internal helper method to apply both filter and search state together on the list binding
			 * @param {object} oTableSearchState an array of filters for the search
			 * @private
			 */
			_applySearch: function(oTableSearchState) {
				var oViewModel = this.getModel("detailView");
				this._oTable.getBinding("items").filter(oTableSearchState, "Application");
				// changes the noDataText of the list in case there are no filter results
				if (oTableSearchState.length !== 0) {
					oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("notFoundTitle"));
				}
			},
			/**
			 * Event handler when the share by E-Mail button has been clicked
			 * @public
			 */
			onShareEmailPress : function () {
				var oViewModel = this.getModel("detailView");

				sap.m.URLHelper.triggerEmail(
					null,
					oViewModel.getProperty("/shareSendEmailSubject"),
					oViewModel.getProperty("/shareSendEmailMessage")
				);
			},
			
			/**
			 * Check an Participant in for the event
			 * @param {object} oEvent an event clicking the check-in button
			 * @private
			 */
			checkInManually : function(oEvent) {
		
				var sPath =  oEvent.getSource().getBindingContext().getPath();
				var oButton = this.byId(oEvent.getParameter("id"));
				
				if (oButton.mProperties.type === 'Accept') {
					var oModel = this.getModel();
					var Ticket = oModel.getProperty(sPath + "/Ticket");
					Ticket.TicketUsed = 'M';
					this.getModel().update("/Ticket(" + Ticket.ParticipantID + ")", Ticket, {
						async : true,
						merge : true,
						success : function(oData, response) { },
						error : function(oError) { alert(oError.message);}
						});
				}
			},
		
			checkInQRSuccess: function(oEvent) {
				var QRCode = oEvent.mParameters.text;
				this._checkDiscountCode(QRCode);
			},
			checkInQRFailed: function(oEvent) {
				return;
				// var discountCode = result.mParameters.text;
				// this._checkDiscountCode(discountCode);
			},
			
			_checkDiscountCode: function(QRCode) {
	
			var checkUrl = "/HANAMDC/com/sap/sapmentors/sitreg/odatareceptionist/checkTicket.xsjs";
			/** @type sap.ui.model.odata.ODataModel */
			this.model = this.getView().getModel();
			var token = this.model.getSecurityToken();
			/** @type sap.ui.model.json.JSONModel */
			var oModel = new sap.ui.model.json.JSONModel();
			var mHeaders = Array();
			mHeaders["X-CSRF-Token"] = token;
			var sData = "SHA256HASH=" + encodeURIComponent(QRCode);
			oModel.attachRequestCompleted(this._discountCodeRequestCompleted.bind(this));
			oModel.loadData(checkUrl, sData, true, 'GET', false, false, mHeaders);
			},
			
			/**
			 * Transforms the ArrayBuffer to a Base64 encoded string
			 * Thx to John Leighton https://gist.github.com/jonleighton/958841#file-gistfile1-js
			 **/
			base64ArrayBuffer: function(arrayBuffer) {
			  var base64    = '';
			  var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
			
			  var bytes         = new Uint8Array(arrayBuffer);
			  var byteLength    = bytes.byteLength;
			  var byteRemainder = byteLength % 3;
			  var mainLength    = byteLength - byteRemainder;
			
			  var a, b, c, d;
			  var chunk;
			
			  // Main loop deals with bytes in chunks of 3
			  for (var i = 0; i < mainLength; i = i + 3) {
			    // Combine the three bytes into a single integer
			    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
			
			    // Use bitmasks to extract 6-bit segments from the triplet
			    a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
			    b = (chunk & 258048)   >> 12; // 258048   = (2^6 - 1) << 12
			    c = (chunk & 4032)     >>  6; // 4032     = (2^6 - 1) << 6
			    d = chunk & 63;               // 63       = 2^6 - 1
			
			    // Convert the raw binary segments to the appropriate ASCII encoding
			    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
			  }
			
			  // Deal with the remaining bytes and padding
			  if (byteRemainder === 1) {
			    chunk = bytes[mainLength];
			
			    a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2
			
			    // Set the 4 least significant bits to zero
			    b = (chunk & 3)   << 4; // 3   = 2^2 - 1
			
			    base64 += encodings[a] + encodings[b] + '==';
			  } else if (byteRemainder == 2) {
			    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
			
			    a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
			    b = (chunk & 1008)  >>  4; // 1008  = (2^6 - 1) << 4
			
			    // Set the 2 least significant bits to zero
			    c = (chunk & 15)    <<  2; // 15    = 2^4 - 1
			
			    base64 += encodings[a] + encodings[b] + encodings[c] + '=';
			  }
			  
			return base64;
			},
			
			_discountCodeRequestCompleted: function(oEvent) {
				var that = this;
				/** @type sap.ui.model.json.JSONModel */
				var model = oEvent.getSource();
				var Ticket = model.getProperty("/OUTC")[0];
			
				if (Ticket.TicketUsed === 'N') {
					
					// Datevalues in History hinder the update
					// Create a new JSON Ticket with relevant data
					var newTicket = {
						'ParticipantID' : Ticket.ParticipantID,
						'EventID'		: Ticket.EventID,
						'SHA256HASH'	: this.base64ArrayBuffer(Ticket.SHA256HASH)
					};	
					
					this.getModel().update("/Ticket(" + Ticket.ParticipantID + ")", newTicket, {
						async : true,
						success : function(oData, response) { 
																// Scan Successful
																that._MessageToast(that.getResourceBundle().getText("scanSuccessful"));
																// Refresh the Table
																that.onRefresh();
															},
						error : function(oError) { console.log(oError); }
						} );
				}
			},
			/**
			 * Updates the item count within the line item table's header
			 * @param {object} oEvent an event containing the total number of items in the list
			 * @private
			 */
			onListUpdateFinished : function (oEvent) {
				var sTitle,
					iTotalItems = oEvent.getParameter("total"),
					oViewModel = this.getModel("detailView");

				// only update the counter if the length is final
				if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
					if (iTotalItems) {
						sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
					} else {
						//Display 'Line Items' instead of 'Line items (0)'
						sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
					}
					oViewModel.setProperty("/lineItemListTitle", sTitle);
				}
			},

			/* =========================================================== */
			/* begin: internal methods                                     */
			/* =========================================================== */

			/**
			 * Binds the view to the object path and expands the aggregated line items.
			 * @function
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
			 * @private
			 */
			_onObjectMatched : function (oEvent) {
				var sObjectId =  oEvent.getParameter("arguments").objectId;
				this.getModel().metadataLoaded().then( function() {
					var sObjectPath = this.getModel().createKey("Events", {
						ID :  sObjectId
					});
					this._bindView("/" + sObjectPath);
				}.bind(this));
			},

			/**
			 * Binds the view to the object path. Makes sure that detail view displays
			 * a busy indicator while data for the corresponding element binding is loaded.
			 * @function
			 * @param {string} sObjectPath path to the object to be bound to the view.
			 * @private
			 */
			_bindView : function (sObjectPath) {
				// Set busy indicator during view binding
				var oViewModel = this.getModel("detailView");

				// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
				oViewModel.setProperty("/busy", false);

				this.getView().bindElement({
					path : sObjectPath,
					events: {
						change : this._onBindingChange.bind(this),
						dataRequested : function () {
							oViewModel.setProperty("/busy", true);
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
				var oView = this.getView(),
					oElementBinding = oView.getElementBinding();

				// No data for the binding
				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("detailObjectNotFound");
					// if object could not be found, the selection in the master list
					// does not make sense anymore.
					this.getOwnerComponent().oListSelector.clearMasterListSelection();
					return;
				}

				var sPath = oElementBinding.getPath(),
					oResourceBundle = this.getResourceBundle(),
					oObject = oView.getModel().getObject(sPath),
					sObjectId = oObject.ID,
					sObjectName = oObject.Location,
					oViewModel = this.getModel("detailView");

				this.getOwnerComponent().oListSelector.selectAListItem(sPath);

				oViewModel.setProperty("/shareSendEmailSubject",
					oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
				oViewModel.setProperty("/shareSendEmailMessage",
					oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
			},

			_onMetadataLoaded : function () {
				// Store original busy indicator delay for the detail view
				var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
					oViewModel = this.getModel("detailView"),
					oLineItemTable = this.byId("lineItemsList"),
					iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

				// Make sure busy indicator is displayed immediately when
				// detail view is displayed for the first time
				oViewModel.setProperty("/delay", 0);
				oViewModel.setProperty("/lineItemTableDelay", 0);

				oLineItemTable.attachEventOnce("updateFinished", function() {
					// Restore original busy indicator delay for line item table
					oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
				});

				// Binding the view will set it to not busy - so the view is always busy if it is not bound
				oViewModel.setProperty("/busy", true);
				// Restore original busy indicator delay for the detail view
				oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
			},
			
			_MessageToast: function(sMessage) {
	    		MessageToast.show(sMessage, {
    				duration: 6000
	    		});
			}

		});

	}
);