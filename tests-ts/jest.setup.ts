import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import '@testing-library/jest-dom';

dayjs.extend(customParseFormat);

// Mock mermaid
jest.mock('mermaid', () => ({
  initialize: jest.fn(),
  render: jest.fn().mockResolvedValue({ svg: '<svg>mocked diagram</svg>' }),
}));
