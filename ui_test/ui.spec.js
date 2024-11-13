/**
 * Tests for all new GUI functionality using Selenium
 */
const { Builder, By, until } = require("selenium-webdriver"); // Added By and until
const chrome = require("selenium-webdriver/chrome");
const chromedriver = require("chromedriver");

/**
 * Tests menu navigation.
 */
async function testMenuNavigation(driver) {
  try {
    // Navigate to the base URL
    await driver.get("http://192.168.56.1:5500");

    // Test "Home" button
    const homeButton = await driver.findElement(By.linkText("DFPS-Home"));
    await homeButton.click();

    // Wait for the page to load and check the URL
    await driver.wait(until.urlIs("http://192.168.56.1:5500/index.html"), 5000);
    console.log("Home button navigation successful.");

    // Test "About" button
    const aboutButton = await driver.findElement(By.linkText("About"));
    await aboutButton.click();

    await driver.get("http://192.168.56.1:5500/about.html");
    console.log("About button navigation successful.");

    // Test "Example" button
    const exampleButton = await driver.findElement(
      By.linkText("Example Application")
    );
    await exampleButton.click();

    await driver.get("http://192.168.56.1:5500/example-DFPS.html");
    console.log("Example button navigation successful.");

    // Test "Exercise" button
    const exerciseButton = await driver.findElement(By.linkText("Exercise"));
    await exerciseButton.click();

    await driver.get("http://192.168.56.1:5500/exercise-DFPS.html");
    console.log("Exercise button navigation successful.");

    // Test "Exploration" button
    const explorationButton = await driver.findElement(
      By.linkText("Further Exploration")
    );
    await explorationButton.click();

    await driver.get("http://192.168.56.1:5500/further-exploration-DFPS.html");
    console.log("Exploration button navigation successful.");

    // Test "Use" button
    const useButton = await driver.findElement(By.linkText("How to Use"));
    await useButton.click();

    await driver.get("http://192.168.56.1:5500/how-to-use-DFPS.html");
    console.log("Use button navigation successful.");

    // Test "Theory" button
    const theoryButton = await driver.findElement(By.linkText("Theory"));
    await theoryButton.click();

    await driver.get("http://192.168.56.1:5500/theory-DFPS.html");
    console.log("Theory button navigation successful.");

    // Test "dfps" button
    const dfpsButton = await driver.findElement(
      By.xpath("//button[contains(text(), 'Run DFPS')]")
    );
    await dfpsButton.click();

    await driver.get("http://192.168.56.1:5500/dfps.html");
    console.log("DFPS button navigation successful.");

    // Test "Groundwater" button
    const gwButton = await driver.findElement(
      By.linkText("The Groundwater Project")
    );
    await gwButton.click();

    await driver.get("https://gw-project.org/");
    console.log("Groundwater button navigation successful.");
  } catch (error) {
    console.error("Error occurred with menu navigation:", error);
  }
}

/**
 * Tests if the graphs are displayed on the dfps page.
 */
async function testGraphsDisplay(driver) {
  try {
    // Navigate to the DFPS page with graphs
    await driver.get("http://192.168.56.1:5500/dfps.html");

    // Check if the qFractionPlot graph is displayed
    const qFractionPlot = await driver.findElement(By.id("qFractionPlot"));
    const isQFractionPlotDisplayed = await qFractionPlot.isDisplayed();
    console.log("qFractionPlot is displayed:", isQFractionPlotDisplayed);

  } catch (error) {
    console.error("Error occurred during graph display check:", error);
  }
}

/**
 * Tests the streamflow graph on the dfps page.
 */
async function testStreamflowGraph(driver) {
  try {
    // Navigate to the DFPS page
    await driver.get("http://192.168.56.1:5500/dfps.html");

    // Find and submit the form with default values
    const form = await driver.findElement(By.id("data_form"));
    await form.submit();

    // Wait for the streamflow plot to be displayed
    const streamflowPlot = await driver.wait(
      until.elementLocated(By.id("streamflowPlot")),
      5000
    );
    const isStreamflowPlotDisplayed = await streamflowPlot.isDisplayed();
    console.log("streamflowPlot is displayed:", isStreamflowPlotDisplayed);

    // Check if the plot contains SVG elements (indicating a plotted graph)
    const svgElements = await streamflowPlot.findElements(By.css("svg"));
    const hasGraph = svgElements.length > 0;
    console.log("streamflowPlot has graph:", hasGraph);

    if (!isStreamflowPlotDisplayed || !hasGraph) {
      throw new Error("Streamflow graph is not properly displayed");
    }
  } catch (error) {
    console.error("Error occurred during streamflow graph check:", error);
    throw error;
  }
}

async function testObsWellGraph(driver) {
  try {
    // Navigate to the DFPS page with graphs
    await driver.get("http://192.168.56.1:5500/dfps.html");

    // Check if the obsWell graph is displayed
    const obsWellOne = await driver.findElement(By.id("obsWellOne"));
    const isObsWell1Displayed = await obsWellOne.isDisplayed();
    console.log("obsWell1 is displayed:", isObsWell1Displayed);

    // Check if the obsWell graph is displayed
    const obsWellTwo = await driver.findElement(By.id("obsWellTwo"));
    const isObsWell2Displayed = await obsWellTwo.isDisplayed();
    console.log("obsWell2 is displayed:", isObsWell2Displayed);

    
  } catch (error) {
    console.error("Error occurred during graph display check:", error);
  }
}

/**
 * Runs the navigation and graph display tests.
 */
async function runTests() {
  // Set Chrome options for headless mode
  const driver = new Builder()
    .forBrowser("chrome")
    .setChromeOptions(new chrome.Options().addArguments("--headless"))
    .build();

  try {
    // Run menu navigation tests
    await testMenuNavigation(driver);

    // Run graph display tests
    await testGraphsDisplay(driver);

    // Run streamflow graph test
    await testStreamflowGraph(driver);

    // Run obsWell graph test
    await testObsWellGraph(driver);

  } finally {
    await driver.quit();
  }
}

// Execute the tests
runTests();
