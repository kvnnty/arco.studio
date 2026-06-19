import { parseArcoProject } from "@arco/project-schema";
import { Composition, registerRoot } from "remotion";
import {
  ArcoComposition,
  defaultArcoProject,
  getArcoCompositionDuration,
  type ArcoCompositionProps,
} from "./ArcoComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ArcoComposition"
        component={ArcoComposition}
        durationInFrames={getArcoCompositionDuration(defaultArcoProject)}
        fps={defaultArcoProject.meta.fps}
        width={defaultArcoProject.meta.width}
        height={defaultArcoProject.meta.height}
        defaultProps={{ project: defaultArcoProject }}
        calculateMetadata={async ({ props }) => {
          const typedProps = props as ArcoCompositionProps;
          const project = parseArcoProject(typedProps.project);
          return {
            durationInFrames: getArcoCompositionDuration(project),
            fps: project.meta.fps,
            width: project.meta.width,
            height: project.meta.height,
          };
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
