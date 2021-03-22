import { Logger } from '../src/logger';

test('Logger', () =>
{
  const opj = {
    prop: 'value'
  };
  Logger.setPrefix('widget');
  Logger.info(opj);
  // Logger.info(opj);
});

