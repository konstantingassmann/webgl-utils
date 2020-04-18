import { mat4, vec3 } from "gl-matrix";

export const camera = (
  gl: WebGLRenderingContext,
  position: Array<number>,
  target: Array<number> = vec3.create()
) => {
  const fov = Math.PI / 4;

  const up = vec3.clone(new Float32Array([0, -1, 0]));

  const cameraPos = vec3.clone(new Float32Array(position));

  const view = mat4.lookAt(mat4.create(), cameraPos, target, up);

  return {
    perspective: () => {
      const projection = mat4.perspective(
        mat4.create(),
        fov,
        gl.canvas.width / gl.canvas.height,
        0.001,
        100
      );

      return {
        projection: projection,
        view,
      };
    },
    clipSpace: () => {
      const projection = mat4.clone([
        2 / gl.canvas.width,
        0,
        0,
        0,
        0,
        -2 / gl.canvas.height,
        0,
        0,
        0,
        0,
        2 / 100,
        0,
        -1,
        1,
        0,
        1,
      ]);

      return {
        projection: projection,
        view,
      };
    },
  };
};
