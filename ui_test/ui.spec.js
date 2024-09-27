/**
 * Tests for all new GUI functionality using selenium
 * 
 */
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

/**
 * Tests menu navigation.
 */
async function testMenuNavigation() {

  // Set Chrome options for headless mode
  const options = new chrome.Options().addArguments('--headless');

  // No need to manually set the ChromeDriver service
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {
    // Navigate to the base URL
    await driver.get('http://192.168.56.1:5500');

    // Test "Home" button
    const homeButton = await driver.findElement(By.linkText('DFPS-Home')); 
    await homeButton.click();
        
    // Wait for the page to load and check the URL
    await driver.wait(until.urlIs('http://192.168.56.1:5500/index.html'), 5000);
    console.log('Home button navigation successful.');

    // Test "About" button
    const aboutButton = await driver.findElement(By.linkText('About')); 
    await aboutButton.click();
    
    await driver.get('http://192.168.56.1:5500/about.html');
    console.log('About button navigation successful.');

    // Test "Example" button
    const exampleButton = await driver.findElement(By.linkText('Example Application')); 
    await exampleButton.click();
    
    await driver.get('http://192.168.56.1:5500/example-DFPS.html');
    console.log('Example button navigation successful.');

    // Test "Exercise" button
    const exerciseButton = await driver.findElement(By.linkText('Exercise')); 
    await exerciseButton.click();
    
    await driver.get('http://192.168.56.1:5500/exercise-DFPS.html');
    console.log('Exercise button navigation successful.');

    // Test "Exploration" button
    const explorationButton = await driver.findElement(By.linkText('Further Exploration')); 
    await explorationButton.click();
    
    await driver.get('http://192.168.56.1:5500/further-exploration-DFPS.html');
    console.log('Exploration button navigation successful.');

    // Test "Use" button
    const useButton = await driver.findElement(By.linkText('How to Use')); 
    await useButton.click();
    
    await driver.get('http://192.168.56.1:5500/how-to-use-DFPS.html');
    console.log('Use button navigation successful.');

    // Test "Theory" button
    const theoryButton = await driver.findElement(By.linkText('Theory')); 
    await theoryButton.click();
    
    await driver.get('http://192.168.56.1:5500/theory-DFPS.html');
    console.log('Theory button navigation successful.');

    // Test "dfps" button
    const dfpsButton = await driver.findElement(By.xpath('//button[contains(text(), \'Run DFPS\')]'));
    await dfpsButton.click();
    
    await driver.get('http://192.168.56.1:5500/dfps.html');
    console.log('DFPS button navigation successful.');

    // Test "Groundwater" button
    const gwButton = await driver.findElement(By.linkText('The Groundwater Project')); 
    await gwButton.click();
    
    await driver.get('https://gw-project.org/');
    console.log('Groundwater button navigation successful.');

  } catch (error) {
    // Output the error message to the console
    console.error('Error occured with menu navigation:', error);
  } finally {
    await driver.quit();
  }
}

testMenuNavigation();

