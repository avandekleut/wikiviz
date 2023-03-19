PYTHON_VERSION=3.8

VIRTUALENV_NAME=local

# install homebrew
command -v brew || ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

# install python
command -v python$PYTHON_VERSION || brew install python@$PYTHON_VERSION

# install poetry
command -v poetry || brew install poetry
poetry config virtualenvs.in-project false

# activate poetry env
poetry env use $PYTHON_VERSION

poetry install

poetry shell