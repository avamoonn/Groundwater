# Groundwater
Groundwater Project

Ava Moon, Iris Nemechek, Colton Morris, David Karibian

# Installing Dependencies

First, update your machine:
```sudo apt-get update```

```sudo apt-get upgrade```

```sudo apt upgrade```

Ensure you are running node 20.17.0:
```curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash ```

```source ~/.bashrc```

```nvm install 20.17.0```

```nvm use 20.17.0```

Install selenium webdriver:
```npm install selenium-webdriver```

Install chrome driver:
```npm install chromedriver```

Install jsdom:
```npm install --save-dev jest-environment-jsdom```


# Seeing website

Click ```Go Live``` button at bottom right of VSCode

# Running tests

For UI tests:

```npm run test:e2e```

For unit tests (ensure they are only in unit_test folder):

```npm run test:unit```
