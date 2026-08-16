/**
 * Hub API – works with public JSONBin (GitHub Pages friendly)
 * No secret keys in the browser.
 * Enable PUBLIC READ + PUBLIC WRITE on your JSONBin bin.
 */
(function () {
  'use strict';

  const DEFAULT_BIN = '6a806543da38895dfee86ff1';
  const cfg = window.JSONBIN_CONFIG || { binId: DEFAULT_BIN };
  const BIN_ID = String(cfg.binId || DEFAULT_BIN).replace(/[^a-zA-Z0-9]/g, '');
  const API = 'https://api.jsonbin.io/v3/b/' + BIN_ID;
  const PROXY = (window.HUB_PROXY_URL || '').replace(/\/$/, '');

  // Rate limit
  const RATE = { windowMs: 60 * 1000, maxSubmits: 5, maxPhotos: 3 };
  function rateKey(a) { return 'fh_rl_' + a; }
  function rateLimitCheck(action, max) {
    try {
      const k = rateKey(action);
      const now = Date.now();
      let arr = JSON.parse(localStorage.getItem(k) || '[]').filter(t => now - t < RATE.windowMs);
      if (arr.length >= max) return false;
      arr.push(now);
      localStorage.setItem(k, JSON.stringify(arr));
      return true;
    } catch (e) { return true; }
  }

  // Honeypot spam check
  function isSpam(form) {
    if (!form) return false;
    const hp = form.querySelector('[name="website"], [name="company_url"], .hp-field');
    if (hp && hp.value && String(hp.value).trim() !== '') return true;
    const t0 = form.getAttribute('data-form-started');
    if (t0 && Date.now() - Number(t0) < 1200) return true;
    return false;
  }

  async function readBin() {
    if (PROXY) {
      const r = await fetch(PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read' })
      });
      if (!r.ok) throw new Error('Proxy read failed ' + r.status);
      const j = await r.json();
      return (j && j.record) ? j.record : (j || {});
    }
    const r = await fetch(API + '/latest', {
      headers: { 'Content-Type': 'application/json', 'X-Bin-Meta-Id': BIN_ID }
    });
    if (!r.ok) {
      // empty / new bin
      if (r.status === 404) return {};
      throw new Error('JSONBin read failed ' + r.status);
    }
    const j = await r.json();
    return (j && j.record) ? j.record : (j || {});
  }

  async function writeBin(data) {
    if (PROXY) {
      const r = await fetch(PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'write', data: data })
      });
      if (!r.ok) throw new Error('Proxy write failed ' + r.status);
      return r.json();
    }
    // Direct public write
    const r = await fetch(API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      throw new Error('JSONBin write failed ' + r.status + ' ' + txt);
    }
    return r.json();
  }

  async function loadFromJsonBin() {
    try {
      const rec = await readBin();
      return {
        applications: Array.isArray(rec.applications) ? rec.applications : [],
        payments: Array.isArray(rec.payments) ? rec.payments : [],
        quizScores: Array.isArray(rec.quizScores) ? rec.quizScores : [],
        accessCodes: Array.isArray(rec.accessCodes) ? rec.accessCodes : [],
        gift_photos: Array.isArray(rec.gift_photos) ? rec.gift_photos : [],
        messages: Array.isArray(rec.messages) ? rec.messages : []
      };
    } catch (e) {
      console.warn('loadFromJsonBin', e);
      return { applications: [], payments: [], quizScores: [], accessCodes: [], gift_photos: [], messages: [] };
    }
  }

  async function saveToJsonBin(bucket, record) {
    if (!rateLimitCheck('save_' + bucket, RATE.maxSubmits)) {
      throw new Error('Please wait a moment before submitting again.');
    }
    const data = await loadFromJsonBin();
    if (!Array.isArray(data[bucket])) data[bucket] = [];
    const row = Object.assign({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), createdAt: new Date().toISOString() }, record);
    data[bucket].unshift(row);
    // keep last 500 per bucket
    if (data[bucket].length > 500) data[bucket] = data[bucket].slice(0, 500);
    await writeBin(data);
    return row;
  }

  async function saveSubmission(formData) {
    const obj = formData && typeof formData.entries === 'function'
      ? Object.fromEntries(formData.entries())
      : (formData || {});
    obj.type = obj.type || 'application';
    return saveToJsonBin('applications', obj);
  }

  async function savePaymentRequest(payload) {
    const obj = Object.assign({ type: 'payment_request' }, payload || {});
    return saveToJsonBin('payments', obj);
  }

  // expose
  window.loadFromJsonBin = loadFromJsonBin;
  window.saveToJsonBin = saveToJsonBin;
  window.saveSubmission = saveSubmission;
  window.savePaymentRequest = savePaymentRequest;
  window.fansHubIsSpam = isSpam;
  window.fansHubRateLimitCheck = rateLimitCheck;
  window.fansHubMarkFormStart = function (form) {
    if (form && !form.getAttribute('data-form-started')) {
      form.setAttribute('data-form-started', String(Date.now()));
    }
  };
})();
