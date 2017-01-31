/*
 jt-lib.js for storing global level functions
 */
var oneSignal = function () {
	return {
		init: function () {
			if (typeof window.plugins != "undefined" && !jt.isOffline()) {
				//window.plugins.OneSignal.setLogLevel({ logLevel: 2, visualLevel: 2 });

				window.plugins.OneSignal
						.startInit("a92950f8-7bf1-462a-9157-e480802c2ae5", "975487375429")
						.inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification)
						.handleNotificationOpened(function (jsonData) {
							if (typeof jsonData.notification.payload.additionalData.article != "undefined" && jsonData.notification.payload.additionalData.article != "") {
								window.BackboneRouter.navigate("article/" + jsonData.notification.payload.additionalData.article, { trigger: true });

								if (!jt.isOffline()) {
									$(".splash .app-refreshed").hide();
								}
							}
						})
						.endInit();
			}
		},
		setSubscription: function (_val) {
			window.localStorage.setItem("push_subscription", (_val === "true" || _val === true));
			$("#notification").prop("checked", (_val === "true" || _val === true));

			if (typeof window.plugins != "undefined" && !jt.isOffline()) {
				window.plugins.OneSignal.setSubscription(_val);
			}
		},
		isSubscribed: function () {
			if (window.localStorage.getItem("push_subscription") == null) {
				window.localStorage.setItem("push_subscription", true);
				$("#notification").prop("checked", true);

				if (typeof window.plugins != "undefined" && !jt.isOffline()) {
					window.plugins.OneSignal.setSubscription(true);
				}
			}
			else {
				$("#notification").prop("checked", (window.localStorage.getItem("push_subscription") === "true" || window.localStorage.getItem("push_subscription") === true));

				if (typeof window.plugins != "undefined" && !jt.isOffline()) {
					window.plugins.OneSignal.setSubscription(window.localStorage.getItem("push_subscription"));
				}
			}

			return window.localStorage.getItem("push_subscription");
		}
	}
}
var oneSignal = oneSignal();