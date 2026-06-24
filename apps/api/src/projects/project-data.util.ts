import { createPendingProject, createScreenshotPendingProject } from '@arco/project-schema';
import {
  applyTemplateToProject,
  getTemplate,
} from '@arco/project-schema/templates';
import type { CreateProjectDto } from './dto/create-project.dto.js';

export function buildInitialProjectData(dto: CreateProjectDto) {
  const isScreenshotMode = dto.projectMode === 'screenshots';

  let projectData = isScreenshotMode
    ? createScreenshotPendingProject(dto.title)
    : createPendingProject(dto.title);

  if (dto.brief) {
    projectData = {
      ...projectData,
      brief: {
        intent: dto.brief.intent,
        productUrl: dto.brief.productUrl,
      },
    };
  }

  if (dto.templateId) {
    const template = getTemplate(dto.templateId);
    if (template) {
      projectData = applyTemplateToProject(projectData, template);
    }
  }

  if (dto.stylePreset && !dto.templateId) {
    projectData = {
      ...projectData,
      stylePreset: dto.stylePreset as typeof projectData.stylePreset,
    };
  }

  if (dto.exportFormat && !dto.templateId) {
    projectData = {
      ...projectData,
      exportFormat: dto.exportFormat as typeof projectData.exportFormat,
    };
  }

  if (dto.projectData) {
    projectData = { ...projectData, ...dto.projectData };
  }

  return projectData;
}
