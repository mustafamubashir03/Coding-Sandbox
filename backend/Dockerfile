FROM node:20-bullseye

# add user
RUN useradd -ms /bin/bash sandbox

WORKDIR /home/sandbox

# optional tools
RUN apt update && apt install -y nano curl

# prompt
RUN echo "PS1='\w'" >> /home/sandbox/.bashrc

WORKDIR /home/sandbox/app
