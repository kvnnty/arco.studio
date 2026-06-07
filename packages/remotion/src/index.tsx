import { parseArcoProject } from "@arco/project-schema";
import { Composition, registerRoot } from "remotion";
import {
  ArcoComposition,
  getArcoCompositionDuration,
} from "./ArcoComposition";
import goldenProject from "./sample/golden-project.json";

const project = parseArcoProject(goldenProject);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ArcoComposition"
        component={ArcoComposition}
        durationInFrames={getArcoCompositionDuration(project)}
        fps={project.meta.fps}
        width={project.meta.width}
        height={project.meta.height}
        defaultProps={{ project }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
