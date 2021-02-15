export class Logger
{
  static levels              = ['all', 'log', 'debug', 'info', 'warning', 'error', 'none'];
  static levelsCategories    = { all: true, none: false };
  static enabledStackTrace   = true;
  static detectSlowBrowsers  = true;
  static slowBrowserDetected = false;

  static setLevelsCategories(levelsCategories): void
  {
    this.levelsCategories = levelsCategories;
  }

  static enable(enable): void
  {
    this.levelsCategories['none'] = !enable;
  }

  static enableStackTrace(enable): void
  {
    this.enabledStackTrace = enable;
  }

  static log(...rest: any[]): void
  {
    if (this.detectSlowBrowsers)
    {
      if (!console.log['apply'] && !this.slowBrowserDetected)
      {

        console.log('This browser is very slow with logs on. Disabling logging. You can change this behavior by setting \'logger.detectSlowBrowsers\' to false.');
        this.slowBrowserDetected = true;
      }
    }

    if (this.slowBrowserDetected)
    {
      return;
    }

    if (this._shouldLog(this, arguments[0], arguments[1]))
    {
      if (arguments[0] === 'error')
      {
        this._error.apply(this, arguments);
      }
      else if (arguments[0] === 'warning')
      {
        this._warn.apply(this, arguments);
      }
      else if (arguments[0] === 'debug')
      {
        this._debug.apply(this, arguments);
      }
      else if (arguments[0] === 'info')
      {
        this._info.apply(this, arguments);
      }
      else if (arguments[0] === 'log')
      {
        this._log.apply(this, arguments);
      }
    }
  }

  /* Return padded string or original string if padding does not fit */
  private static _padString(str, strPaddedLen, padChar): string
  {
    const paddedLen = strPaddedLen - str.length;
    if (paddedLen > 0)
    {
      const padding = Array(paddedLen + 1).join(padChar);
      return padding + str;
    }
    return str;
  }

  private static _getCurrentTime(): string
  {
    const currentdate = new Date();
    return this._padString((currentdate.getMonth() + 1).toString(), 2, '0') + '/'
      + this._padString(currentdate.getDate().toString(), 2, '0') + '/'
      + currentdate.getFullYear() + ' '
      + this._padString(currentdate.getHours().toString(), 2, '0') + ':'
      + this._padString(currentdate.getMinutes().toString(), 2, '0') + ':'
      + this._padString(currentdate.getSeconds().toString(), 2, '0') + '.'
      + this._padString(currentdate.getMilliseconds().toString(), 3, '0');
  }

  private static _getStack(): any[]
  {
    // looked up at http://stackoverflow.com/questions/4671031/print-function-log-stack-trace-for-entire-program-using-firebug
    const callstack          = [];
    let isCallstackPopulated = false;
    // tslint:disable-next-line:one-variable-per-declaration
    let lines, i, len;
    try
    {
      i.dont.exist += 0; // doesn't exist- that's the point
    }
    catch (e)
    {
      if (e.stack)
      {
        // Firefox / chrome
        lines = e.stack.split('\n');
        for (i = 0, len = lines.length; i < len; i++)
        {
          callstack.push(lines[i]);
        }
        // Remove call to logStackTrace()
        callstack.shift();
        isCallstackPopulated = true;
      }
      else if (window['opera'] && e.message)
      {
        // Opera
        let entry;
        lines = e.message.split('\n');
        for (i = 0, len = lines.length; i < len; i++)
        {
          if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/))
          {
            entry = lines[i];
            // Append next line also since it has the file info
            if (lines[i + 1])
            {
              entry += lines[i + 1];
              i++;
            }
            callstack.push(entry);
          }
        }
        // Remove call to logStackTrace()
        callstack.shift();
        isCallstackPopulated = true;
      }
    }
    if (!isCallstackPopulated)
    {
      // IE and Safari
      let currentFunction = this._getStack.caller; // This is violation of strict mode of ES5, but the use case is valid
      let fn;
      let fname;
      while (currentFunction)
      {
        fn    = currentFunction.toString();
        fname = fn.substring(fn.indexOf('function') + 8, fn.indexOf('(')) || 'anonymous';
        callstack.push(fname);
        currentFunction = currentFunction.caller;
      }
    }
    return callstack;
  }

  private static _getParams(args): any[]
  {
    const params = [];
    let i;
    params.push('' + this._getCurrentTime() + ' - ');
    params.push('[' + args[0] + ']');
    params.push('[' + args[1] + ']');
    if (args && (args.length > 2))
    {
      for (i = 2; i < args.length; i++)
      {
        params.push(args[i]);
      }
    }
    try
    {
      if (this.enabledStackTrace)
      {
        params.push({
          stacktrace: this._getStack().slice(3)
        });
      }
    }
    catch (ignore)
    {
    }
    return params;
  }

  private static _shouldLog(logger, level, category): boolean
  {

    if (logger.levelsCategories['none'])
    {
      return false;
    }

    if (logger.levelsCategories['all'])
    {
      return true;
    }

    const askLevel = this.levels.indexOf(level);
    const minLevel = this.levels.indexOf(logger.levelsCategories[category]);

    if (askLevel === -1 || minLevel === -1)
    {
      return false;
    }

    return askLevel >= minLevel;
  }

  private static _jsonStringify(obj): string
  {
    let jsonString = '';
    try
    {
      jsonString = JSON.stringify(arguments);
    }
    catch (err)
    {
      jsonString = 'Failed to stringify. Debugging in this browser is not recommended';
    }
    return jsonString;
  }

  private static _error(): void
  {
    if (console.error['apply'])
    {
      console.error.apply(console, this._getParams(arguments));
    }
    else
    {
      console.error(this._jsonStringify(arguments));
    }
  }

  private static _log(): void
  {
    if (console.log['apply'])
    {
      console.log.apply(console, this._getParams(arguments));
    }
    else
    {
      console.log(this._jsonStringify(arguments));
    }
  }

  private static _warn(): void
  {
    if (console.warn['apply'])
    {
      console.warn.apply(console, this._getParams(arguments));
    }
    else
    {
      console.warn(this._jsonStringify(arguments));
    }
  }

  private static _info(): void
  {
    if (!console.info)
    {
      console.info = console.log;
    }
    if (console.info['apply'])
    {
      console.info.apply(console, this._getParams(arguments));
    }
    else
    {
      console.info(this._jsonStringify(arguments));
    }
  }


  private static _debug(): void
  {
    if (!console.debug)
    {
      console.debug = console.log;
    }
    if (console.debug['apply'])
    {
      console.debug.apply(console, this._getParams(arguments));
    }
    else
    {
      console.debug(this._jsonStringify(arguments));
    }
  }
}
