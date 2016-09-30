jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"com/sap/sapmentors/sitreg/receptionist/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"com/sap/sapmentors/sitreg/receptionist/test/integration/pages/App",
	"com/sap/sapmentors/sitreg/receptionist/test/integration/pages/Browser",
	"com/sap/sapmentors/sitreg/receptionist/test/integration/pages/Master",
	"com/sap/sapmentors/sitreg/receptionist/test/integration/pages/Detail",
	"com/sap/sapmentors/sitreg/receptionist/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "com.sap.sapmentors.sitreg.receptionist.view."
	});

	sap.ui.require([
		"com/sap/sapmentors/sitreg/receptionist/test/integration/NavigationJourneyPhone",
		"com/sap/sapmentors/sitreg/receptionist/test/integration/NotFoundJourneyPhone",
		"com/sap/sapmentors/sitreg/receptionist/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});