FROM node:8.4.0

RUN useradd --user-group --create-home --shell /bin/false app

ENV HOME=/home

COPY . $HOME/observe-2ch
RUN chown -R app:app $HOME

USER app
WORKDIR $HOME/observe-2ch

ENV PATH=$HOME/observe-2ch/node_modules/.bin:$PATH
RUN npm install
