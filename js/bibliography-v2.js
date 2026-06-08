(function () {
  const monthOrder = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const bibliographyTargets = [
    ['journal-bib', 'refereed_journal.bib'],
    ['conference-bib', 'refereed_conference.bib'],
    ['workshop-bib', 'refereed_workshop.bib'],
    ['non-refereed-bib', 'non-refereed.bib'],
    ['awards-bib', 'awards.bib', 'awards'],
    ['grants-bib', 'grants.bib', 'grants'],
  ];

  function decodeLatex(text) {
    if (!text) return text;

    return text
      .replace(/\{\\'\s*\\i\s*\}|\{\\'\\i\}|\\'\\i/g, '\u00ed')
      .replace(/\{\\'([aeiouAEIOUnN])\}|\\'([aeiouAEIOUnN])/g, function (_match, braced, bare) {
        const ch = braced || bare;
        const map = {
          a: '\u00e1',
          e: '\u00e9',
          i: '\u00ed',
          o: '\u00f3',
          u: '\u00fa',
          n: '\u0144',
          A: '\u00c1',
          E: '\u00c9',
          I: '\u00cd',
          O: '\u00d3',
          U: '\u00da',
          N: '\u0143',
        };
        return map[ch] || ch;
      })
      .replace(/\\`([aeiouAEIOU])/g, function (_match, ch) {
        const map = {
          a: '\u00e0',
          e: '\u00e8',
          i: '\u00ec',
          o: '\u00f2',
          u: '\u00f9',
          A: '\u00c0',
          E: '\u00c8',
          I: '\u00cc',
          O: '\u00d2',
          U: '\u00d9',
        };
        return map[ch] || ch;
      })
      .replace(/\\"([aeiouAEIOU])/g, function (_match, ch) {
        const map = {
          a: '\u00e4',
          e: '\u00eb',
          i: '\u00ef',
          o: '\u00f6',
          u: '\u00fc',
          A: '\u00c4',
          E: '\u00cb',
          I: '\u00cf',
          O: '\u00d6',
          U: '\u00dc',
        };
        return map[ch] || ch;
      })
      .replace(/\\~([nNoO])/g, function (_match, ch) {
        const map = {
          n: '\u00f1',
          N: '\u00d1',
          o: '\u00f5',
          O: '\u00d5',
        };
        return map[ch] || ch;
      })
      .replace(/\\c\{([cC])\}/g, function (_match, ch) {
        return ch === 'c' ? '\u00e7' : '\u00c7';
      })
      .replace(/\\%/g, '%')
      .replace(/\{([^{}]*)\}/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function extractBibField(entry, fieldName) {
    const regex = new RegExp('(?:^|[,\\{\\s])' + fieldName + '\\s*=\\s*', 'i');
    const match = regex.exec(entry);
    if (!match) return null;

    let i = match.index + match[0].length;
    if (i >= entry.length) return null;

    const opener = entry[i];
    if (opener === '{') {
      let depth = 1;
      let j = i + 1;
      while (j < entry.length && depth > 0) {
        if (entry[j] === '{') depth += 1;
        if (entry[j] === '}') depth -= 1;
        j += 1;
      }
      return entry.slice(i + 1, j - 1);
    }

    if (opener === '"') {
      let j = i + 1;
      while (j < entry.length) {
        if (entry[j] === '"' && entry[j - 1] !== '\\') break;
        j += 1;
      }
      return entry.slice(i + 1, j);
    }

    let j = i;
    while (j < entry.length && entry[j] !== ',' && entry[j] !== '\n') j += 1;
    return entry.slice(i, j).trim();
  }

  function normalizeAuthorName(name) {
    const decoded = decodeLatex(name || '');
    const commaMatch = decoded.match(/^([^,]+),\s*(.+)$/);
    if (commaMatch) return commaMatch[2].trim() + ' ' + commaMatch[1].trim();
    return decoded;
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function isUrl(url) {
    return /^https?:\/\//i.test(url || '');
  }

  function formatBadge(note) {
    if (!note || !note.trim()) return '';

    return '<span class="bib-badge">' + escapeHtml(note.trim()) + '</span>';
  }

  function formatAuthors(author) {
    if (!author) return '';

    const authors = author.split(/\s+and\s+/i).map(function (rawName) {
      const hasAsterisk = rawName.indexOf('*') !== -1;
      const normalized = normalizeAuthorName(rawName).replace(/\*/g, '').trim();
      const isMe = /\bHikari\b\s+\bOtsuka\b/i.test(normalized) || /\u5927\u585a\s*\u5149\u8389/.test(normalized);
      const displayName = isMe ? '<span class="bib-me">Hikari Otsuka</span>' : escapeHtml(normalized);
      return displayName + (hasAsterisk ? '*' : '');
    });

    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return authors.join(' and ');

    const last = authors[authors.length - 1];
    return authors.slice(0, -1).join(', ') + ', and ' + last;
  }

  function formatVenue(entry, fileType) {
    const journal = decodeLatex(extractBibField(entry, 'journal'));
    const booktitle = decodeLatex(extractBibField(entry, 'booktitle'));
    const pages = extractBibField(entry, 'pages');
    const yearMatch = entry.match(/year\s*=\s*\{?(\d{4}(?:-\d{4})?)/i);
    const monthMatch = entry.match(/month\s*=\s*\{?([^,}]+)/i);
    const url = extractBibField(entry, 'url');
    const note = decodeLatex(extractBibField(entry, 'note'));

    let venueLine = '';
    if (fileType === 'awards' || fileType === 'others') {
      if (monthMatch && yearMatch) venueLine = monthMatch[1].trim() + ' ' + yearMatch[1];
      else if (yearMatch) venueLine = yearMatch[1];
    } else if (fileType === 'grants') {
      if (yearMatch) venueLine = yearMatch[1];
    } else {
      venueLine = journal || booktitle || '';
      if (pages) venueLine += ', pp.' + pages.replace(/--/g, '-');
      if (yearMatch) venueLine += (venueLine ? ', ' : '') + yearMatch[1];
    }

    const parts = [];
    if (venueLine) parts.push('<span>' + escapeHtml(venueLine) + '</span>');
    if (isUrl(url)) {
      parts.push('<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener">URL</a>');
    }
    if (note && note.trim() && fileType !== 'awards' && fileType !== 'others') parts.push(formatBadge(note));

    return parts.join(' ');
  }

  function formatBibEntry(entry, fileType) {
    const title = decodeLatex(extractBibField(entry, 'title'));
    const author = extractBibField(entry, 'author');
    const venue = formatVenue(entry, fileType);
    const authors = formatAuthors(author);

    return [
      '<article class="bib-entry">',
      title ? '<h3 class="bib-title">' + escapeHtml(title) + '</h3>' : '',
      authors ? '<p class="bib-authors">' + authors + '</p>' : '',
      venue ? '<div class="bib-meta">' + venue + '</div>' : '',
      '</article>',
    ].join('');
  }

  function parseBib(bibContent, fileType) {
    const entries = [];
    const entryRegex = /@\w+\{[^@]+(?=@|\s*$)/gs;
    let match;

    while ((match = entryRegex.exec(bibContent)) !== null) {
      const entry = match[0].trim();
      const yearMatch = entry.match(/year\s*=\s*\{?(\d{4})/i);
      const monthMatch = entry.match(/month\s*=\s*\{?([^,}]+)/i);
      const author = extractBibField(entry, 'author') || '';

      let authorOrder = 999;
      author.split(/\s+and\s+/i).forEach(function (rawName, index) {
        const normalized = normalizeAuthorName(rawName).replace(/\*/g, '').trim();
        if (/\bHikari\b\s+\bOtsuka\b/i.test(normalized) || /\u5927\u585a\s*\u5149\u8389/.test(normalized)) {
          authorOrder = Math.min(authorOrder, index);
        }
      });

      entries.push({
        text: entry,
        year: yearMatch ? parseInt(yearMatch[1], 10) : 0,
        month: monthMatch ? monthMatch[1].trim() : '',
        authorOrder: authorOrder,
      });
    }

    entries.sort(function (a, b) {
      if (b.year !== a.year) return b.year - a.year;

      const monthA = monthOrder.indexOf(a.month);
      const monthB = monthOrder.indexOf(b.month);
      if (monthB !== monthA) return monthB - monthA;

      return a.authorOrder - b.authorOrder;
    });

    return entries.map(function (entry) {
      return formatBibEntry(entry.text, fileType);
    }).join('');
  }

  async function loadBib(elementId, bibFile, fileType) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.innerHTML = '<p class="bib-loading">Loading...</p>';

    try {
      const response = await fetch('contents/works/' + bibFile);
      if (!response.ok) throw new Error(response.status + ' ' + response.statusText);
      const bibContent = await response.text();
      element.innerHTML = parseBib(bibContent, fileType || 'default');
    } catch (error) {
      element.innerHTML = '<p class="bib-error">Could not load bibliography.</p>';
      console.error('Error loading ' + bibFile + ':', error);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    bibliographyTargets.forEach(function (target) {
      loadBib(target[0], target[1], target[2]);
    });
  });
}());
