import type { Preview } from '@storybook/angular-vite';
import './styles.scss';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
    a11y: { test: 'error' },
    options: {
      storySort: {
        order: [
          'Components',
          [
            '*',
            ['Overview', 'API', 'Examples', 'States', 'Accessibility', '*'],
          ],
        ],
      },
    },
  },
};

export default preview;
