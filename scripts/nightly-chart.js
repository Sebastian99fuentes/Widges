VSS.init({
    explicitNotifyLoaded: true,
    usePlatformStyles: true,
});
VSS.require([
    "TFS/Dashboards/WidgetHelpers", 
    "Charts/Services",
    "TFS/Dashboards/Services"
    ],
    function (WidgetHelpers, Services, DashboardServices) {
        WidgetHelpers.IncludeWidgetStyles();
        VSS.register("nightly-chart", function () { 
            return {
                load: function(widgetSettings) {

                    var $title = $('h2.title');
                    $title.text(widgetSettings.name,"text prueba");

                    if (!widgetSettings || !widgetSettings.customSettings || !widgetSettings.customSettings.data) {
                        return showConfigureWidget(widgetSettings, DashboardServices, WidgetHelpers);
                    }
                    
                    var settings = JSON.parse(widgetSettings.customSettings.data);

                    if (!settings.projectKey || !settings.authToken) {
                        return showConfigureWidget(widgetSettings, DashboardServices, WidgetHelpers);
                    }
                    
                          // Call the fetchSonarQubeData function here to retrieve lines of code
                       fetchSonarQubeData(settings.projectKey, settings.authToken)
                       .then(function (linesOfCode) {
                          // Update the widget content with the retrieved lines of code
                       console.log(`Lines of code in project ${settings.projectKey}: ${linesOfCode}`);
                       var $container = $('#Chart-Container');
                       $container.text('Project Key: ' + settings.projectKey  + ' Lines of Code: ' + linesOfCode);
                       // You can use the linesOfCode variable to update the widget's UI here
                       }).catch(function (error) {
                      console.error('Error fetching lines of code:', error);
                         // Handle any errors that occur during data fetching
                   });

                }
            }
        });
        VSS.notifyLoadSucceeded();
    }
);

function showConfigureWidget(widgetSettings, dashboardServices, widgetHelpers) {
    $('#Configure-Widget').css('display', 'block');
    var height = 70;
    if(widgetSettings.size.rowSpan == 3) {
        height = 150;
    }
    $('#Configure-Widget-Text').css('margin-top', height + 'px');

    dashboardServices.WidgetHostService.getService().then((DashboardServiceHost) => {
        DashboardServiceHost.showConfiguration();
    });
    return widgetHelpers.WidgetStatusHelper.Unconfigured();
}

async function fetchSonarQubeData(projectKey, authToken) {
    const sonarqubeUrl = 'https://sonarqube.saludsa.com.ec:9001'; 
    console.log(`fetchSonarQubeData of code in project ${projectKey}`);
    try {
        const response = await fetch(`${sonarqubeUrl}/api/measures/component?component=${projectKey}&metricKeys=ncloc`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // const linesOfCode = data.component.measures.find(measure => measure.metric === 'ncloc').value;
        const measure = data.component.measures.find(measure => measure.metric === 'ncloc');
        const linesOfCode = measure ? measure.value : 0;

        console.log(`Lines of code in project ${projectKey}: ${linesOfCode}`);
        return linesOfCode;
    } catch (error) {
        console.error('Error fetching lines of code:', error);
        throw error;
    }
}

