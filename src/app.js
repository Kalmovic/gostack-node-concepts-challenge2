const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateRepoId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: "id not valid" });
  }

  return next();
}

function validateLikes(request, response, next) {
  const { likes } = request.body;

  if (likes) {
    return response.status(400).json({ error: "You cant manually edit likes" });
  }

  return next();
}

app.use("/repositories/:id*", validateRepoId, validateLikes);

app.get("/repositories", (request, response) => {
  response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const repository = { id: uuid(), title, url, techs, likes: 0 };

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;
  const repoIndex = repositories.findIndex((repo) => repo.id === id);

  if (repoIndex < 0) {
    return response.status(400).json({ error: "Repository not found" });
  }

  const repoUpdated = {
    ...repositories[repoIndex],
    id,
    title: title ? title : repositories[repoIndex].title,
    url: url ? url : repositories[repoIndex].url,
    techs: techs ? techs : repositories[repoIndex].techs,
    likes: repositories[repoIndex].likes,
  };

  repositories[repoIndex] = repoUpdated;

  return response.json(repoUpdated);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const repoIndex = repositories.findIndex((repo) => repo.id === id);

  if (repoIndex < 0) {
    return response.status(400).json({ error: "Repository not found" });
  }

  repositories.splice(repoIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  const repoIndex = repositories.findIndex((repo) => repo.id === id);

  if (repoIndex < 0) {
    return response.status(400).json({ error: "Repository not found" });
  }

  repositories[repoIndex].likes++;

  return response.json(repositories[repoIndex]);
});

module.exports = app;