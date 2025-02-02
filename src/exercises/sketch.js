const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const palettes = require('nice-color-palettes');

const settings = {
  dimensions: [ 2048, 2048 ],
  pixelsPerInch: 300,
  orientation: 'landscape'
};

const sketch = () => {
  const colorCount = random.rangeFloor(2 , 6);
  const palette = random.shuffle(random.pick(palettes)
    .slice(0, colorCount));

  const createGrid = () => {
    const points = [];
    const count = 40;
    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        const u = count <= 1 ? 0.5 : x / (count - 1);
        const v = count <= 1 ? 0.5 : y / (count - 1);
        const noise = random.noise2D(u, v);
        const radius = Math.abs(noise) * 0.05;
        points.push({
          color: random.pick(palette),
          radius,
          rotation: noise,
          position: [u, v],
        });
      }
    }

    return points;
  };

  const points = createGrid().filter(() => random.value() > 0.5);
  const margin = 400;

  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    points.forEach(data => {
      const {
        radius,
        position,
        color,
        rotation
      } = data;

      // to add margins
      const [ u, v ] = position;
      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, height - margin, v);

      // context.beginPath();
      // multiply per width to make it relative to resolution and size, so 
      // we do not break it if those change
      // context.arc(x, y, radius * width, 0, Math.PI * 2, false);
      // context.lineWidth = 20;
      // context.fillStyle = color;
      // context.fill();

      context.save();
      context.fillStyle = color;
      context.font = `${radius * width}px "Arial"`;
      context.translate(x, y)
      context.rotate(rotation);
      context.fillText('→', 0, 0);
      context.restore();
    })
  };
};

canvasSketch(sketch, settings);
