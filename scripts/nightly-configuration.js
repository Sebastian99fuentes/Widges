VSS.init({
    explicitNotifyLoaded: true,
    usePlatformStyles: true,
});

VSS.require(["TFS/Dashboards/WidgetHelpers"], function (WidgetHelpers) {
    WidgetHelpers.IncludeWidgetConfigurationStyles();
    VSS.register("nightly-chart.Configuration", function () {
        function notifyConfigurationChange(widgetConfigurationContext) {
            const customSettings = {
                data: JSON.stringify({
                    projectKey: $("#projectKey-textbox").val(),
                    authToken: $("#authToken-textbox").val(),
                }),
            };
            const eventArgs = WidgetHelpers.WidgetEvent.Args(customSettings);
            widgetConfigurationContext.notify(
                WidgetHelpers.WidgetEvent.ConfigurationChange,
                eventArgs
            );
        }

        function validateInputs() {
            let isValid = true;
            if (!$("#projectKey-input").val()) {
                $("#projectKey-error").show();
                isValid = false;
            }
            if (!$("#authToken-input").val()) {
                $("#authToken-error").show();
                isValid = false;
            }
            if (isValid) $(".validation-error").hide();
            return isValid;
        }

        return {
            load: function (widgetSettings, widgetConfigurationContext) {
                let settings;
                try {
                    settings = JSON.parse(widgetSettings.customSettings.data || "{}");
                } catch (e) {
                    console.error("Error parsing widget settings:", e);
                    settings = {};
                }

                $("#projectKey-input").val(settings.projectKey || "");
                $("#authToken-input").val(settings.authToken || "");

                $("input").on("onInput", function () {
                    notifyConfigurationChange(widgetConfigurationContext);
                });

                return WidgetHelpers.WidgetStatusHelper.Success();
            },
            onSave: function () {
                if (!validateInputs()) {
                    return WidgetHelpers.WidgetConfigurationSave.Invalid();
                }

                const customSettings = {
                    data: JSON.stringify({
                        projectKey: $("#projectKey-input").val(),
                        authToken: $("#authToken-input").val(),
                    }),
                };
                return WidgetHelpers.WidgetConfigurationSave.Valid(customSettings);
            },
        };
    });

    VSS.notifyLoadSucceeded();
});
