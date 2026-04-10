import { Hono } from "hono"
import { describeRoute, validator } from "hono-openapi"
import { resolver } from "hono-openapi"
import { Instance } from "../../project/instance"
import { Project } from "../../project/project"
import z from "zod"
import { ProjectID } from "../../project/schema"
import { errors } from "../error"
import { lazy } from "../../util/lazy"
import { InstanceBootstrap } from "../../project/bootstrap"

export const ProjectRoutes = lazy(() =>
  new Hono()
    .get(
      "/",
      describeRoute({
        summary: "List all projects",
        description: "Get a list of projects that have been opened with OpenCode.",
        operationId: "project.list",
        responses: {
          200: {
            description: "List of projects",
            content: {
              "application/json": {
                schema: resolver(Project.Info.array()),
              },
            },
          },
        },
      }),
      async (c) => {
        const projects = Project.list()
        return c.json(projects)
      },
    )
    .get(
      "/current",
      describeRoute({
        summary: "Get current project",
        description: "Retrieve the currently active project that OpenCode is working with.",
        operationId: "project.current",
        responses: {
          200: {
            description: "Current project information",
            content: {
              "application/json": {
                schema: resolver(Project.Info),
              },
            },
          },
        },
      }),
      async (c) => {
        return c.json(Instance.project)
      },
    )
    .post(
      "/git/init",
      describeRoute({
        summary: "Initialize git repository",
        description: "Create a git repository for the current project and return the refreshed project info.",
        operationId: "project.initGit",
        responses: {
          200: {
            description: "Project information after git initialization",
            content: {
              "application/json": {
                schema: resolver(Project.Info),
              },
            },
          },
        },
      }),
      async (c) => {
        const dir = Instance.directory
        const prev = Instance.project
        const next = await Project.initGit({
          directory: dir,
          project: prev,
        })
        if (next.id === prev.id && next.vcs === prev.vcs && next.worktree === prev.worktree) return c.json(next)
        await Instance.reload({
          directory: dir,
          worktree: dir,
          project: next,
          init: InstanceBootstrap,
        })
        return c.json(next)
      },
    )
    .post(
      "/create",
      describeRoute({
        summary: "Create new project",
        description: "Automatically create a new sandbox project directory, initialize git, and register it.",
        operationId: "project.create",
        responses: {
          200: {
            description: "Created project info and directory path",
            content: {
              "application/json": {
                schema: resolver(
                  z.object({
                    project: Project.Info,
                    directory: z.string(),
                  }),
                ),
              },
            },
          },
        },
      }),
      validator("json", z.object({ name: z.string().optional() }).optional()),
      async (c) => {
        const body = c.req.valid("json") ?? {}
        const result = await Project.create({ name: body?.name })
        return c.json(result)
      },
    )
    .patch(
      "/:projectID",
      describeRoute({
        summary: "Update project",
        description: "Update project properties such as name, icon, and commands.",
        operationId: "project.update",
        responses: {
          200: {
            description: "Updated project information",
            content: {
              "application/json": {
                schema: resolver(Project.Info),
              },
            },
          },
          ...errors(400, 404),
        },
      }),
      validator("param", z.object({ projectID: ProjectID.zod })),
      validator("json", Project.UpdateInput.omit({ projectID: true })),
      async (c) => {
        const projectID = c.req.valid("param").projectID
        const body = c.req.valid("json")
        const project = await Project.update({ ...body, projectID })
        return c.json(project)
      },
    ),
)
