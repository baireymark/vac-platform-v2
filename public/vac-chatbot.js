/*!
 * Gunny (VAC chat assistant) — embeddable chat widget for veteransadvocatecenter.com
 * Drop-in, no dependencies. Renders inside a Shadow DOM so it won't clash
 * with Elementor / WordPress theme styles.
 *
 * Install:  <script src="/path/to/vac-chatbot.js" defer></script>
 * Optional config (place BEFORE the script tag):
 *   <script>window.VACChatConfig = { leadWebhook: "https://...", aiEndpoint: "" };</script>
 */
(function () {
  'use strict';
  if (window.__vacChatLoaded) return;
  window.__vacChatLoaded = true;

  /* ------------------------------------------------------------------ */
  /* Config                                                              */
  /* ------------------------------------------------------------------ */
  var DEFAULTS = {
    botName: 'Gunny',
    siteUrl: 'https://veteransadvocatecenter.com',
    phone: '+1 877-822-2023',
    phoneHref: 'tel:18778222023',
    email: 'info@vac2023.com',
    facebook: 'https://www.facebook.com/veteransadvocatecenter',
    avatar: 'https://veteransadvocatecenter.com/wp-content/uploads/2025/01/cropped-VAC-Logo-New-e1736777079693-270x270.jpg',
    leadWebhook: '/api/lead', // POST JSON leads here; /api/lead emails them over SMTP (api/[form].js). Empty = email/phone fallback.
    aiEndpoint: '',       // Optional: POST {messages:[...]} -> {reply:"..."}. Used only when no FAQ answer matches.
    position: 'right',    // 'right' | 'left'
    ink: '#16233A',       // header + user bubbles
    accent: '#B8892B',    // buttons, chips, focus
    teaser: true,         // small greeting bubble after a few seconds
    teaserDelay: 7000,
    zIndex: 2147483000
  };
  var cfg = Object.assign({}, DEFAULTS, window.VACChatConfig || {});
  var SITE = cfg.siteUrl.replace(/\/$/, '');

  /* ------------------------------------------------------------------ */
  /* Knowledge base (sourced from veteransadvocatecenter.com)            */
  /* ------------------------------------------------------------------ */
  var L = {
    form: SITE + '/#form',
    services: SITE + '/services/',
    about: SITE + '/about-us/',
    stories: SITE + '/success-stories/',
    resources: SITE + '/resources/',
    contact: SITE + '/contact-us-2/',
    calculator: SITE + '/#calculator',
    privacy: SITE + '/privacy-policy/',
    terms: SITE + '/terms-conditions/',
    appealPost: SITE + '/how-to-appeal-a-denied-claim/',
    mistakesPost: SITE + '/common-mistakes-veterans-make-when-applying-for-benefits/',
    transitionPost: SITE + '/tips-for-successfully-transitioning-from-military-to-civilian-life/'
  };
  function a(href, text) {
    var ext = /^https?:/.test(href) && href.indexOf(SITE) !== 0;
    return '<a href="' + href + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + text + '</a>';
  }
  var CALL = a(cfg.phoneHref, cfg.phone);
  var MAIL = a('mailto:' + cfg.email, cfg.email);

  var MAIN_CHIPS = ['Check if I qualify', 'I was denied', 'Your services', 'Talk to an advocate'];

  var KB = [
    {
      id: 'greeting',
      keys: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'yo'],
      answer: 'Hi there, and thank you for your service. I can answer questions about Veterans Advocate Center, walk you through a quick eligibility check, or connect you with an advocate. What can I help with?',
      chips: MAIN_CHIPS
    },
    {
      id: 'about',
      keys: ['about', 'who are you', 'what is vac', 'who is vac', 'veterans advocate center', 'company', 'organization', 'veteran owned', 'veteran-owned', 'mission', 'experience'],
      answer: 'Veterans Advocate Center (VAC) is a <b>veteran-owned and operated</b> organization focused on making the VA benefits process simpler. Whether you\u2019ve been denied before or have never applied, the team works to help you pursue the benefits you\u2019ve earned. Their motto: <i>turning disabilities into possibilities</i>.<br><br>More on the ' + a(L.about, 'About Us page') + '.',
      chips: ['Your services', 'How does it work?', 'Check if I qualify']
    },
    {
      id: 'services',
      keys: ['services', 'service', 'what do you do', 'offer', 'help with', 'provide', 'what can you do'],
      answer: 'VAC provides three main services:<ul>' +
        '<li><b>Benefits eligibility assessment</b> \u2014 a review of your service history and circumstances to identify benefits you may have earned.</li>' +
        '<li><b>Application assistance</b> \u2014 help making sure your application is complete and accurate before it\u2019s submitted.</li>' +
        '<li><b>Appeal support</b> \u2014 reviewing denied claims and helping you pursue them further.</li></ul>' +
        'Details are on the ' + a(L.services, 'Services page') + '.',
      chips: ['Check if I qualify', 'I was denied', 'How does it work?']
    },
    {
      id: 'eligibility_service',
      keys: ['eligibility assessment', 'assessment', 'evaluate', 'evaluation', 'free evaluation', 'review my case'],
      answer: 'The <b>Benefits Eligibility Assessment</b> looks at your service history and your unique situation to figure out which benefits you may qualify for, then guides you on next steps. The evaluation is free to start. Want to begin the quick eligibility check here?',
      chips: ['Check if I qualify', 'Talk to an advocate']
    },
    {
      id: 'application',
      keys: ['apply', 'application', 'applying', 'file a claim', 'filing', 'new claim', 'never applied', 'start a claim', 'paperwork', 'forms'],
      answer: 'Filing for VA benefits can be overwhelming. VAC\u2019s <b>Application Assistance</b> helps make sure your application is complete, accurate, and submitted correctly to give it the best chance of approval.<br><br>A few common mistakes to avoid: missing medical or service records, missed deadlines, and not realizing the full range of benefits you may be eligible for. ' + a(L.mistakesPost, 'Read the full article') + '.',
      chips: ['Check if I qualify', 'Common mistakes', 'Talk to an advocate']
    },
    {
      id: 'denied',
      keys: ['denied', 'denial', 'rejected', 'appeal', 'appeals', 'appealing', 'turned down', 'declined', 'reconsider', 'nod', 'notice of disagreement', 'supplemental claim', 'board of veterans appeals', 'bva'],
      answer: '<b>Denied before? Don\u2019t give up.</b> VA denials are common and are often caused by small errors or missing information. VAC\u2019s Appeal Support focuses on finding and fixing those issues.<br><br>General steps after a denial:<ol>' +
        '<li>Read your denial letter closely \u2014 it lists the reasons and the evidence the VA considered.</li>' +
        '<li>Gather new or missing evidence that addresses those reasons (updated medical records, service documents, expert opinions).</li>' +
        '<li>Respond within the required deadline through the appropriate review option.</li>' +
        '<li>If needed, the case can go further, such as to the Board of Veterans\u2019 Appeals or a supplemental claim with new evidence.</li></ol>' +
        a(L.appealPost, 'Read: How to Appeal a Denied Claim') + '.',
      chips: ['Talk to an advocate', 'Success story', 'How long does it take?']
    },
    {
      id: 'benefits',
      keys: ['benefits', 'qualify for', 'what benefits', 'eligible', 'eligibility', 'entitled', 'healthcare', 'health care', 'compensation', 'disability compensation', 'education', 'gi bill', 'home loan', 'housing', 'va loan', 'pension', 'vocational', 'survivor', 'dependents', 'spouse', 'widow'],
      answer: 'Depending on your service and circumstances, veterans can qualify for:<ul>' +
        '<li>Healthcare</li><li>Disability compensation</li><li>Education assistance</li><li>Home loans / housing</li>' +
        '<li>Pension benefits</li><li>Vocational training</li><li>Survivor support programs</li></ul>' +
        'The fastest way to see what may apply to you is the quick eligibility check.',
      chips: ['Check if I qualify', 'Rating calculator']
    },
    {
      id: 'timeline',
      keys: ['how long', 'timeline', 'take', 'time frame', 'timeframe', 'wait', 'waiting', 'fast', 'quick', 'months', 'weeks'],
      answer: 'It varies by case. The benefits process typically takes <b>several months</b>, and appeals can extend that to <b>a year or longer</b>. Having complete evidence up front is one of the best ways to avoid extra delays.',
      chips: ['Check if I qualify', 'Talk to an advocate']
    },
    {
      id: 'process',
      keys: ['how does it work', 'process', 'steps', 'how it works', 'get started', 'start', 'next step', 'what happens'],
      answer: 'Working with VAC takes three steps:<ol>' +
        '<li><b>Eligibility check</b> \u2014 answer a few quick questions.</li>' +
        '<li><b>Personalized plan</b> \u2014 a veteran advocate builds a strategy for your claim or appeal.</li>' +
        '<li><b>Results you deserve</b> \u2014 the team works to help you secure the benefits you\u2019ve earned.</li></ol>' +
        'You can do step one right here in this chat.',
      chips: ['Check if I qualify', 'Talk to an advocate']
    },
    {
      id: 'cost',
      keys: ['cost', 'price', 'fee', 'fees', 'charge', 'pay', 'free', 'how much', 'expensive', 'afford'],
      answer: 'Your initial evaluation with VAC is <b>free</b>. For any questions about fees beyond the evaluation, an advocate can walk you through the details \u2014 call ' + CALL + ' or email ' + MAIL + '.<br><br>Good to know: free help is also available from VA-accredited Veterans Service Organizations (VSOs) and VA.gov.',
      chips: ['Check if I qualify', 'Talk to an advocate']
    },
    {
      id: 'accredited',
      keys: ['accredited', 'accreditation', 'lawyer', 'attorney', 'law firm', 'legal', 'represent', 'representation', 'vso', 'agent', 'legit', 'licensed', 'scam'],
      answer: 'To be clear about what VAC is and isn\u2019t: VAC is <b>not</b> a law firm, attorney, or VA-accredited claims agent, and it does <b>not</b> represent veterans before the VA or the Board of Veterans\u2019 Appeals.<br><br>Free resources are available to help with preparing, filing, and processing VA disability claims, including accredited Veterans Service Organizations and ' + a('https://www.va.gov/get-help-from-accredited-representative/', 'VA.gov\u2019s accredited representative search') + '.',
      chips: ['Your services', 'Talk to an advocate']
    },
    {
      id: 'mistakes',
      keys: ['mistakes', 'mistake', 'avoid', 'tips', 'documents', 'evidence', 'records', 'medical records', 'dd214', 'dd-214', 'what do i need', 'prepare'],
      answer: 'Common mistakes when applying for benefits:<ul>' +
        '<li>Submitting without supporting evidence (medical records, service documents, proof of disability).</li>' +
        '<li>Missing deadlines for claims or appeals.</li>' +
        '<li>Not knowing the full range of benefits available.</li>' +
        '<li>Waiting to file because you think your condition isn\u2019t \u201Cbad enough.\u201D</li></ul>' +
        'Keep detailed records of service-related injuries and conditions. ' + a(L.mistakesPost, 'Read the full article') + '.',
      chips: ['Check if I qualify', 'I was denied']
    },
    {
      id: 'transition',
      keys: ['transition', 'civilian', 'leaving the military', 'separation', 'separating', 'job', 'jobs', 'career', 'employment', 'school', 'college'],
      answer: 'Moving from military to civilian life goes smoother with planning, networking, and using the resources available to you. VAC has an article with practical tips: ' + a(L.transitionPost, 'Tips for transitioning to civilian life') + '. More on the ' + a(L.resources, 'Resources page') + '.',
      chips: ['What benefits can I get?', 'Talk to an advocate']
    },
    {
      id: 'story',
      keys: ['success', 'story', 'stories', 'results', 'testimonial', 'testimonials', 'reviews', 'example', 'helped', 'david'],
      answer: '<b>David, an Army veteran</b>, had been denied benefits for over five years. VAC found missing medical evidence in his file, an appeal was filed, and he secured his benefits within three months.<br><br>See more on the ' + a(L.stories, 'Success Stories page') + '. Every case is different, and past results don\u2019t guarantee a particular outcome.',
      chips: ['I was denied', 'Check if I qualify']
    },
    {
      id: 'calculator',
      keys: ['calculator', 'calculate', 'rating', 'combined rating', 'percentage', 'percent', 'va math', 'how much will i get', 'compensation rate', 'rates'],
      answer: 'You can estimate your combined disability rating with VAC\u2019s ' + a(L.calculator, 'VA rating calculator') + '. Official compensation rates are published on ' + a('https://www.va.gov/disability/compensation-rates/', 'VA.gov') + '.',
      chips: ['Check if I qualify', 'Talk to an advocate']
    },
    {
      id: 'contact',
      keys: ['contact', 'phone', 'call', 'number', 'email', 'reach', 'talk', 'speak', 'human', 'person', 'agent', 'advocate', 'representative', 'someone', 'book', 'appointment', 'schedule', 'consultation', 'office', 'hours'],
      answer: 'You can reach a Veterans Advocate Center advocate here:<ul>' +
        '<li>Phone: ' + CALL + '</li>' +
        '<li>Email: ' + MAIL + '</li>' +
        '<li>' + a(cfg.facebook, 'Facebook') + '</li></ul>' +
        'Or leave your details right here and an advocate will reach out.',
      chips: ['Request a callback', 'Check if I qualify']
    },
    {
      id: 'sms',
      keys: ['sms', 'text messages', 'texts', 'unsubscribe', 'opt out', 'opt-out', 'stop texting', 'message rates'],
      answer: 'If you\u2019ve opted in to text messages from VAC, reply <b>STOP</b> to any message to opt out, or <b>HELP</b> for assistance. You can also call ' + CALL + '. Message and data rates may apply. See the ' + a(L.privacy, 'Privacy Policy') + ' and ' + a(L.terms, 'Terms') + '.'
    },
    {
      id: 'privacy',
      keys: ['privacy', 'data', 'personal information', 'terms', 'conditions', 'policy'],
      answer: 'You can read VAC\u2019s ' + a(L.privacy, 'Privacy Policy') + ' and ' + a(L.terms, 'Terms & Conditions') + ' on the website.'
    },
    {
      id: 'thanks',
      keys: ['thanks', 'thank you', 'thx', 'appreciate', 'great', 'awesome', 'perfect', 'ok', 'okay', 'cool'],
      answer: 'You\u2019re welcome. Is there anything else I can help with?',
      chips: MAIN_CHIPS
    },
    {
      id: 'bye',
      keys: ['bye', 'goodbye', 'see you', 'later', 'that\'s all', 'thats all', 'done'],
      answer: 'Take care. If you need anything, I\u2019m right here, or call ' + CALL + '.'
    }
  ];

  // Quick-reply chips that start flows rather than FAQ answers
  var CHIP_ACTIONS = {
    'check if i qualify': 'eligibility',
    'request a callback': 'callback',
    'talk to an advocate': 'callback'
  };
  var CHIP_ALIASES = {
    'i was denied': 'denied',
    'your services': 'services',
    'how does it work?': 'process',
    'how long does it take?': 'timeline',
    'common mistakes': 'mistakes',
    'success story': 'story',
    'rating calculator': 'calculator',
    'what benefits can i get?': 'benefits'
  };

  var CRISIS_RE = /\b(suicid\w*|kill (myself|me)|end (my|it all)|want to die|don'?t want to (live|be here)|self[- ]?harm|hurt myself|no reason to live|crisis)\b/i;
  var CRISIS_HTML = '<b>If you\u2019re thinking about suicide or are in crisis, please reach out now.</b> The Veterans Crisis Line is free, confidential, and available 24/7:<ul>' +
    '<li>Call <a href="tel:988">988</a> and press 1</li>' +
    '<li>Text <a href="sms:838255">838255</a></li>' +
    '<li>Chat at ' + a('https://www.veteranscrisisline.net/', 'VeteransCrisisLine.net') + '</li></ul>' +
    'If you\u2019re in immediate danger, call 911. You don\u2019t have to go through this alone.';

  /* ------------------------------------------------------------------ */
  /* Matching                                                            */
  /* ------------------------------------------------------------------ */
  function norm(s) {
    return (' ' + String(s).toLowerCase().replace(/[\u2019']/g, '\'').replace(/[^a-z0-9%' -]+/g, ' ').replace(/\s+/g, ' ') + ' ');
  }
  function match(text) {
    var t = norm(text);
    var words = t.trim().split(' ');
    var best = null, bestScore = 0;
    KB.forEach(function (e) {
      var s = 0;
      e.keys.forEach(function (k) {
        if (k.indexOf(' ') > -1) {
          if (t.indexOf(' ' + k + ' ') > -1 || t.indexOf(k) > -1) s += 3;
        } else if (t.indexOf(' ' + k + ' ') > -1) {
          s += k.length > 3 ? 2 : 1;
        } else if (k.length >= 5) {
          for (var i = 0; i < words.length; i++) {
            if (words[i].length >= 5 && (words[i].indexOf(k) === 0 || k.indexOf(words[i]) === 0)) { s += 1; break; }
          }
        }
      });
      // Small talk shouldn't win over a real question
      if ((e.id === 'greeting' || e.id === 'thanks' || e.id === 'bye') && words.length > 4) s *= 0.4;
      if (s > bestScore) { bestScore = s; best = e; }
    });
    return bestScore >= 1 ? best : null;
  }

  /* ------------------------------------------------------------------ */
  /* Guided flows                                                        */
  /* ------------------------------------------------------------------ */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function phoneOk(v) { return v.replace(/\D/g, '').length >= 10; }

  var CONTACT_STEPS = [
    { key: 'name', q: 'What\u2019s your name?', type: 'text', placeholder: 'Full name',
      validate: function (v) { return v.trim().length >= 2 || 'Please enter your name.'; } },
    { key: 'email', q: 'What\u2019s the best email to reach you?', type: 'text', placeholder: 'you@example.com',
      validate: function (v) { return EMAIL_RE.test(v.trim()) || 'That email doesn\u2019t look right. Please check it and try again.'; } },
    { key: 'phone', q: 'And your phone number?', type: 'text', placeholder: '(555) 555-5555',
      validate: function (v) { return phoneOk(v) || 'Please enter a 10-digit phone number.'; } },
    { key: 'consent', type: 'choice',
      q: 'Last step. By sharing your phone number you agree to the ' + a(L.terms, 'Terms') + ' and ' + a(L.privacy, 'Privacy Policy') + ', and consent to calls and SMS from Veterans Advocate Center about benefits screening, claim updates, and reminders. Message frequency varies; message and data rates may apply. Reply STOP to opt out or HELP for help.',
      options: ['I agree', 'No thanks'] }
  ];

  var FLOWS = {
    eligibility: {
      intro: 'Great \u2014 this takes about a minute. You can type <b>cancel</b> at any time.',
      steps: [
        { key: 'applied', q: 'Have you ever applied for VA benefits?', type: 'choice', options: ['Yes', 'No'] },
        { key: 'denied', q: 'Have you been denied in the past?', type: 'choice', options: ['Yes', 'No'],
          skipIf: function (d) { return d.applied === 'No'; } },
        { key: 'branch', q: 'Which branch did you serve in?', type: 'choice',
          options: ['Army', 'Navy', 'Air Force', 'Marine Corps', 'Coast Guard', 'Space Force', 'None'] },
        { key: 'era', q: 'When did you serve?', type: 'choice', options: ['Pre-1990', '1990\u20132001', 'Post-2001'] },
        { key: 'rating', q: 'What is your current disability rating?', type: 'choice', options: ['No rating', '10%\u201390%', '100%'] }
      ].concat(CONTACT_STEPS),
      summary: function (d) {
        var msg;
        if (d.denied === 'Yes') msg = 'Since you\u2019ve been denied before, an advocate can review what happened and where missing evidence may have hurt your claim.';
        else if (d.applied === 'No') msg = 'Since you haven\u2019t applied yet, an advocate can help you identify which benefits fit your service and get your application right the first time.';
        else if (d.rating === '10%\u201390%') msg = 'With a current rating between 10% and 90%, an advocate can look at whether your rating reflects all of your service-connected conditions.';
        else if (d.rating === '100%') msg = 'With a 100% rating, an advocate can help you check for other benefits you may not be using yet.';
        else msg = 'An advocate will review your answers and outline your options.';
        return msg;
      }
    },
    callback: {
      intro: 'Happy to connect you with an advocate. I just need a few details. Type <b>cancel</b> any time.',
      steps: [
        { key: 'topic', q: 'What would you like help with?', type: 'choice',
          options: ['New claim', 'Denied claim / appeal', 'Increase my rating', 'Something else'] }
      ].concat(CONTACT_STEPS),
      summary: function () { return 'An advocate will reach out soon.'; }
    }
  };

  /* ------------------------------------------------------------------ */
  /* State + persistence (sessionStorage keeps the chat across pages)    */
  /* ------------------------------------------------------------------ */
  var STORE_KEY = 'vac-chat-v1';
  var state = { open: false, log: [], flow: null, teaserSeen: false };
  try {
    var saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null');
    if (saved && Array.isArray(saved.log)) state = Object.assign(state, saved, { flow: null });
  } catch (e) { /* storage unavailable */ }
  function persist() {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify({ open: state.open, log: state.log.slice(-60), teaserSeen: state.teaserSeen, lastChips: state.lastChips })); } catch (e) { }
  }

  /* ------------------------------------------------------------------ */
  /* UI                                                                  */
  /* ------------------------------------------------------------------ */
  var CSS = '' +
    ':host{all:initial;--ink:' + cfg.ink + ';--accent:' + cfg.accent + ';--paper:#FFFFFF;--mist:#EEF1F5;--line:#D9DEE6;--text:#1F2733;--muted:#5C6675;' +
    'font-family:var(--vac-font,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif);font-size:15px;line-height:1.5;color:var(--text)}' +
    '*{box-sizing:border-box}' +
    '.side{position:fixed;bottom:20px;' + (cfg.position === 'left' ? 'left' : 'right') + ':20px;z-index:' + cfg.zIndex + ';display:flex;flex-direction:column;align-items:' + (cfg.position === 'left' ? 'flex-start' : 'flex-end') + ';gap:12px}' +
    '.launch{width:60px;height:60px;border-radius:50%;border:0;background:var(--ink);color:#fff;cursor:pointer;display:grid;place-items:center;box-shadow:0 6px 20px rgba(22,35,58,.35);position:relative;transition:transform .15s}' +
    '.launch:hover{transform:scale(1.05)}' +
    '.launch:focus-visible,button:focus-visible,input:focus-visible,a:focus-visible{outline:3px solid var(--accent);outline-offset:2px}' +
    '.launch svg{width:28px;height:28px}' +
    '.launch .ring{position:absolute;inset:-4px;border-radius:50%;border:2px solid var(--accent)}' +
    '.teaser{max-width:260px;background:var(--paper);border:1px solid var(--line);border-radius:14px 14px 4px 14px;padding:12px 34px 12px 14px;box-shadow:0 8px 24px rgba(22,35,58,.15);font-size:14px;position:relative;cursor:pointer}' +
    '.teaser .x{position:absolute;top:6px;right:6px;border:0;background:none;color:var(--muted);font-size:18px;line-height:1;cursor:pointer;padding:2px 6px}' +
    '.panel{width:380px;height:600px;max-height:calc(100vh - 110px);background:var(--paper);border-radius:16px;box-shadow:0 18px 50px rgba(22,35,58,.28);display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--line);transform-origin:bottom ' + (cfg.position === 'left' ? 'left' : 'right') + ';animation:pop .18s ease-out}' +
    '@keyframes pop{from{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:none}}' +
    '.head{background:var(--ink);color:#fff;padding:14px 14px 12px;display:flex;align-items:center;gap:12px;border-bottom:3px solid var(--accent)}' +
    '.av{width:40px;height:40px;border-radius:50%;background:#fff;flex:none;overflow:hidden;display:grid;place-items:center;font-weight:700;color:var(--ink)}' +
    '.av img{width:100%;height:100%;object-fit:cover}' +
    '.who{flex:1;min-width:0}.who b{display:block;font-size:16px}.who span{font-size:12.5px;opacity:.8}' +
    '.hbtn{background:transparent;border:0;color:#fff;opacity:.85;cursor:pointer;padding:6px;border-radius:8px;display:grid;place-items:center}' +
    '.hbtn:hover{opacity:1;background:rgba(255,255,255,.1)}.hbtn svg{width:18px;height:18px}' +
    '.log{flex:1;overflow-y:auto;padding:16px 14px 8px;display:flex;flex-direction:column;gap:10px;background:#F7F8FA}' +
    '.msg{max-width:86%;padding:10px 13px;border-radius:14px;word-wrap:break-word;font-size:14.5px}' +
    '.bot{background:var(--paper);border:1px solid var(--line);border-bottom-left-radius:4px;align-self:flex-start}' +
    '.user{background:var(--ink);color:#fff;border-bottom-right-radius:4px;align-self:flex-end;white-space:pre-wrap}' +
    '.msg ul,.msg ol{margin:6px 0;padding-left:20px}.msg li{margin:2px 0}' +
    '.msg a{color:#1C5FA8;text-decoration:underline}.user a{color:#fff}' +
    '.crisis{border-left:4px solid #B3261E}' +
    '.chips{display:flex;flex-wrap:wrap;gap:6px;align-self:flex-start;max-width:100%}' +
    '.chip{border:1.5px solid var(--accent);background:var(--paper);color:var(--ink);border-radius:999px;padding:6px 12px;font:inherit;font-size:13.5px;font-weight:600;cursor:pointer}' +
    '.chip:hover{background:var(--accent);color:#fff}' +
    '.typing{display:inline-flex;gap:4px;padding:12px 14px}.typing i{width:7px;height:7px;border-radius:50%;background:var(--muted);animation:b 1s infinite ease-in-out}' +
    '.typing i:nth-child(2){animation-delay:.15s}.typing i:nth-child(3){animation-delay:.3s}' +
    '@keyframes b{0%,80%,100%{opacity:.3;transform:none}40%{opacity:1;transform:translateY(-3px)}}' +
    '.foot{border-top:1px solid var(--line);padding:10px 10px 8px;background:var(--paper)}' +
    '.row{display:flex;gap:8px}' +
    '.in{flex:1;border:1px solid var(--line);border-radius:10px;padding:10px 12px;font:inherit;font-size:14.5px;color:var(--text);background:#fff;min-width:0}' +
    '.in:focus{border-color:var(--accent);outline:none;box-shadow:0 0 0 3px rgba(184,137,43,.25)}' +
    '.send{border:0;background:var(--accent);color:#fff;border-radius:10px;width:44px;cursor:pointer;display:grid;place-items:center}' +
    '.send:disabled{opacity:.45;cursor:default}.send svg{width:18px;height:18px}' +
    '.fine{font-size:11px;color:var(--muted);margin:7px 2px 0;line-height:1.35}' +
    '.fine a{color:var(--muted)}' +
    '.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}' +
    '@media (max-width:480px){.side{right:12px;left:auto;bottom:12px}.panel{position:fixed;inset:0;width:100%;height:100%;max-height:none;border-radius:0;border:0}}' +
    '@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}';

  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M12 8.2l1.1 2.2 2.4.3-1.8 1.7.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.7 2.4-.3z" fill="currentColor" stroke="none"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var ICON_DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var ICON_RESET = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  var host = document.createElement('div');
  host.id = 'vac-chat-root';
  var root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
  root.innerHTML = '<style>' + CSS + '</style><div class="side"></div>';
  var side = root.querySelector('.side');

  var panel, logEl, inputEl, sendEl, launcher, teaserEl, liveEl;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function buildLauncher() {
    launcher = document.createElement('button');
    launcher.className = 'launch';
    launcher.setAttribute('aria-label', 'Open chat with ' + cfg.botName);
    launcher.innerHTML = ICON_CHAT + '<span class="ring" aria-hidden="true"></span>';
    launcher.addEventListener('click', toggle);
    side.appendChild(launcher);
  }

  function buildPanel() {
    panel = document.createElement('div');
    panel.className = 'panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', cfg.botName);
    panel.innerHTML =
      '<div class="head">' +
        '<div class="av"><img alt="" src="' + esc(cfg.avatar) + '"></div>' +
        '<div class="who"><b>' + esc(cfg.botName) + '</b><span>Veteran-owned \u00B7 Usually replies instantly</span></div>' +
        '<button class="hbtn" data-act="reset" aria-label="Start over" title="Start over">' + ICON_RESET + '</button>' +
        '<button class="hbtn" data-act="close" aria-label="Minimize chat" title="Minimize">' + ICON_DOWN + '</button>' +
      '</div>' +
      '<div class="log" aria-live="polite"></div>' +
      '<div class="foot">' +
        '<form class="row" novalidate>' +
          '<label class="sr" for="vac-in">Type your message</label>' +
          '<input id="vac-in" class="in" autocomplete="off" placeholder="Ask about benefits, appeals\u2026" maxlength="600">' +
          '<button class="send" type="submit" aria-label="Send">' + ICON_SEND + '</button>' +
        '</form>' +
        '<p class="fine">Automated assistant with general information only \u2014 not legal advice. VAC is not a VA-accredited agent or law firm. Not affiliated with the VA.</p>' +
      '</div>';
    var img = panel.querySelector('.av img');
    img.addEventListener('error', function () { img.parentNode.textContent = 'VAC'; });
    logEl = panel.querySelector('.log');
    inputEl = panel.querySelector('.in');
    sendEl = panel.querySelector('.send');
    panel.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = inputEl.value.trim();
      if (!v) return;
      inputEl.value = '';
      handleUser(v);
    });
    panel.querySelector('[data-act="close"]').addEventListener('click', toggle);
    panel.querySelector('[data-act="reset"]').addEventListener('click', reset);
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(); });
    logEl.addEventListener('click', function (e) {
      var chip = e.target.closest && e.target.closest('.chip');
      if (chip) handleUser(chip.getAttribute('data-v'), true);
    });
    side.insertBefore(panel, launcher);
  }

  function renderMsg(m) {
    var div = document.createElement('div');
    div.className = 'msg ' + m.from + (m.crisis ? ' crisis' : '');
    if (m.from === 'user') div.textContent = m.text; else div.innerHTML = m.html;
    logEl.appendChild(div);
  }
  function renderChips(list) {
    clearChips();
    if (!list || !list.length) return;
    var wrap = document.createElement('div');
    wrap.className = 'chips';
    list.forEach(function (c) {
      var b = document.createElement('button');
      b.className = 'chip'; b.type = 'button'; b.textContent = c; b.setAttribute('data-v', c);
      wrap.appendChild(b);
    });
    logEl.appendChild(wrap);
  }
  function clearChips() { if (!logEl) return; logEl.querySelectorAll('.chips').forEach(function (n) { n.remove(); }); }
  function scroll() { if (logEl) logEl.scrollTop = logEl.scrollHeight; }

  function pushBot(html, chips, opts) {
    var m = { from: 'bot', html: html, crisis: opts && opts.crisis };
    state.log.push(m);
    state.lastChips = chips || null;
    if (logEl) { clearChips(); renderMsg(m); renderChips(chips); scroll(); }
    persist();
  }
  function pushUser(text) {
    var m = { from: 'user', text: text };
    state.log.push(m);
    if (logEl) { clearChips(); renderMsg(m); scroll(); }
    persist();
  }

  var typingEl = null;
  function typing(on) {
    if (!logEl) return;
    if (on && !typingEl) {
      typingEl = document.createElement('div');
      typingEl.className = 'msg bot typing';
      typingEl.setAttribute('aria-label', 'Assistant is typing');
      typingEl.innerHTML = '<i></i><i></i><i></i>';
      logEl.appendChild(typingEl); scroll();
    } else if (!on && typingEl) { typingEl.remove(); typingEl = null; }
  }
  function reply(html, chips, opts) {
    typing(true);
    setTimeout(function () { typing(false); pushBot(html, chips, opts); }, 420 + Math.min(700, html.length * 2));
  }

  function welcome() {
    pushBot('Hi, I\u2019m ' + esc(cfg.botName) + '. I can answer questions about VA benefits help from Veterans Advocate Center, run a quick eligibility check, or connect you with an advocate.', MAIN_CHIPS);
  }

  function open() {
    if (!panel) buildPanel();
    panel.style.display = '';
    state.open = true;
    launcher.setAttribute('aria-expanded', 'true');
    launcher.style.display = window.innerWidth <= 480 ? 'none' : '';
    launcher.innerHTML = ICON_CLOSE;
    launcher.setAttribute('aria-label', 'Close chat');
    if (teaserEl) { teaserEl.remove(); teaserEl = null; }
    state.teaserSeen = true;
    if (!logEl.childNodes.length) {
      if (state.log.length) { state.log.forEach(renderMsg); renderChips(state.lastChips || MAIN_CHIPS); scroll(); }
      else welcome();
    }
    persist();
    setTimeout(function () { inputEl && inputEl.focus(); }, 60);
  }
  function close() {
    if (panel) panel.style.display = 'none';
    state.open = false;
    launcher.style.display = '';
    launcher.innerHTML = ICON_CHAT + '<span class="ring" aria-hidden="true"></span>';
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-label', 'Open chat with ' + cfg.botName);
    persist();
    launcher.focus();
  }
  function toggle() { state.open ? close() : open(); }
  function reset() {
    state.log = []; state.flow = null; state.lastChips = null;
    logEl.innerHTML = '';
    persist();
    welcome();
  }

  function showTeaser() {
    if (!cfg.teaser || state.teaserSeen || state.open) return;
    teaserEl = document.createElement('div');
    teaserEl.className = 'teaser';
    teaserEl.setAttribute('role', 'status');
    teaserEl.innerHTML = 'Denied before, or never applied? I can check what you may qualify for in about a minute.<button class="x" aria-label="Dismiss">\u00D7</button>';
    teaserEl.addEventListener('click', function (e) {
      if (e.target.classList.contains('x')) { teaserEl.remove(); teaserEl = null; state.teaserSeen = true; persist(); e.stopPropagation(); return; }
      open();
    });
    side.insertBefore(teaserEl, launcher);
  }

  /* ------------------------------------------------------------------ */
  /* Conversation logic                                                  */
  /* ------------------------------------------------------------------ */
  function startFlow(name) {
    var f = FLOWS[name];
    state.flow = { name: name, i: -1, data: {} };
    reply(f.intro);
    setTimeout(nextStep, 900);
  }
  function currentStep() { var f = state.flow; return f ? FLOWS[f.name].steps[f.i] : null; }
  function nextStep() {
    var f = state.flow; if (!f) return;
    var steps = FLOWS[f.name].steps;
    do { f.i++; } while (f.i < steps.length && steps[f.i].skipIf && steps[f.i].skipIf(f.data));
    if (f.i >= steps.length) return finishFlow();
    var s = steps[f.i];
    reply(s.q, s.type === 'choice' ? s.options : null);
    if (inputEl) inputEl.placeholder = s.placeholder || (s.type === 'choice' ? 'Choose an option above' : 'Type your answer');
  }
  function answerStep(v) {
    var s = currentStep();
    if (s.key === 'consent' && /^(y|yes|yeah|yep|agree|i agree|ok|okay|sure)$/i.test(v.trim())) v = 'I agree';
    if (s.key === 'consent' && /^(n|no|nope|no thanks|decline)$/i.test(v.trim())) v = 'No thanks';
    if (s.type === 'choice') {
      var hit = s.options.filter(function (o) { return o.toLowerCase() === v.toLowerCase(); })[0] ||
                s.options.filter(function (o) { return o.toLowerCase().indexOf(v.toLowerCase()) === 0; })[0];
      if (!hit) { reply('Please choose one of the options below.', s.options); return; }
      v = hit;
    } else if (s.validate) {
      var ok = s.validate(v);
      if (ok !== true) { reply(ok); return; }
      v = v.trim();
    }
    state.flow.data[s.key] = v;
    if (s.key === 'consent' && v === 'No thanks') {
      state.flow = null;
      if (inputEl) inputEl.placeholder = 'Ask about benefits, appeals\u2026';
      reply('No problem \u2014 nothing has been sent. You can always reach an advocate directly at ' + CALL + ' or ' + MAIL + '.', MAIN_CHIPS);
      return;
    }
    nextStep();
  }

  function finishFlow() {
    var f = state.flow; state.flow = null;
    if (inputEl) inputEl.placeholder = 'Ask about benefits, appeals\u2026';
    var d = f.data;
    var tip = FLOWS[f.name].summary(d);
    var lead = {
      source: 'website-chatbot',
      flow: f.name,
      submittedAt: new Date().toISOString(),
      page: location.href,
      name: d.name, email: d.email, phone: d.phone, smsConsent: d.consent === 'I agree',
      answers: {
        topic: d.topic || null,
        appliedBefore: d.applied || null,
        deniedBefore: d.denied || (d.applied === 'No' ? 'N/A' : null),
        branch: d.branch || null,
        serviceEra: d.era || null,
        disabilityRating: d.rating || null
      }
    };
    var first = esc(String(d.name || '').split(' ')[0]);

    if (cfg.leadWebhook) {
      typing(true);
      fetch(cfg.leadWebhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) })
        .then(function (r) {
          // /api/lead answers {ok:true} or {ok:false,error:"..."}; other webhooks only need a 2xx.
          return r.json().catch(function () { return {}; }).then(function (body) {
            if (!r.ok || body.ok === false) throw new Error('HTTP ' + r.status + (body.error ? ': ' + body.error : ''));
          });
        })
        .then(function () {
          typing(false);
          pushBot('Thanks, ' + first + '. Your request was sent. ' + esc(tip) + ' An advocate will contact you at ' + esc(d.phone) + ' or ' + esc(d.email) + '.<br><br>Need help sooner? Call ' + CALL + '.', ['Your services', 'How long does it take?']);
          try { window.dispatchEvent(new CustomEvent('vac:lead', { detail: lead })); } catch (e) { }
        })
        .catch(function (err) {
          typing(false);
          if (window.console) console.warn('[VAC chat] Lead email failed (' + cfg.leadWebhook + '): ' + (err && err.message));
          fallbackSend(lead, first, tip);
        });
    } else {
      fallbackSend(lead, first, tip);
    }
  }

  // No webhook (or it failed): hand the user a prefilled email + phone so the lead isn't lost.
  function fallbackSend(lead, first, tip) {
    var A = lead.answers;
    var lines = [
      'Name: ' + lead.name, 'Email: ' + lead.email, 'Phone: ' + lead.phone,
      A.topic && ('Help needed: ' + A.topic),
      A.appliedBefore && ('Applied before: ' + A.appliedBefore),
      A.deniedBefore && ('Denied before: ' + A.deniedBefore),
      A.branch && ('Branch: ' + A.branch), A.serviceEra && ('Served: ' + A.serviceEra),
      A.disabilityRating && ('Current rating: ' + A.disabilityRating),
      'SMS consent: ' + (lead.smsConsent ? 'Yes' : 'No')
    ].filter(Boolean).join('\n');
    var href = 'mailto:' + cfg.email + '?subject=' + encodeURIComponent('Free evaluation request \u2014 ' + lead.name) + '&body=' + encodeURIComponent('Hello VAC,\n\nI\u2019d like a free evaluation.\n\n' + lines + '\n');
    reply('Thanks, ' + first + '. ' + esc(tip) + '<br><br>To send your details to an advocate, tap <b>' + a(href, 'Email my answers to VAC') + '</b> (it opens pre-filled), or call ' + CALL + ' to talk now.', ['Your services', 'How long does it take?']);
  }

  function handleUser(text, fromChip) {
    pushUser(text);
    var low = text.toLowerCase().trim();

    if (CRISIS_RE.test(text)) { reply(CRISIS_HTML, ['Talk to an advocate'], { crisis: true }); return; }

    if (state.flow) {
      if (/^(cancel|stop|quit|exit|nevermind|never mind)$/.test(low)) {
        state.flow = null;
        if (inputEl) inputEl.placeholder = 'Ask about benefits, appeals\u2026';
        reply('Okay, I stopped. Nothing was sent. What else can I help with?', MAIN_CHIPS);
        return;
      }
      answerStep(text);
      return;
    }

    if (CHIP_ACTIONS[low]) { startFlow(CHIP_ACTIONS[low]); return; }
    if (/\b(qualify|eligib\w*)\b/.test(low) && /\b(check|see|find out|am i|test|quiz)\b/.test(low)) { startFlow('eligibility'); return; }
    if (/\b(call ?back|call me|contact me|reach out to me|have someone)\b/.test(low)) { startFlow('callback'); return; }

    var hit = CHIP_ALIASES[low] ? KB.filter(function (e) { return e.id === CHIP_ALIASES[low]; })[0] : match(text);
    if (hit) { reply(hit.answer, hit.chips || MAIN_CHIPS); return; }

    if (cfg.aiEndpoint) { askAI(); return; }
    reply('I\u2019m not sure I have the answer to that one. An advocate can help: call ' + CALL + ', email ' + MAIL + ', or leave your details and they\u2019ll reach out.', ['Request a callback', 'Your services', 'Check if I qualify']);
  }

  // Optional AI fallback through YOUR server (never put an API key in this file).
  function askAI() {
    typing(true);
    var history = state.log.slice(-12).map(function (m) {
      return { role: m.from === 'user' ? 'user' : 'assistant', content: m.from === 'user' ? m.text : m.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() };
    });
    while (history.length && history[0].role !== 'user') history.shift();
    fetch(cfg.aiEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }) })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        typing(false);
        var txt = (data && data.reply) ? String(data.reply) : '';
        if (!txt) throw new Error('empty');
        var html = esc(txt).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(https?:\/\/[^\s<]+)/g, function (u) { return '<a href="' + u + '" target="_blank" rel="noopener">' + u + '</a>'; }).replace(/\n/g, '<br>');
        pushBot(html, ['Check if I qualify', 'Talk to an advocate']);
      })
      .catch(function () {
        typing(false);
        pushBot('I couldn\u2019t answer that right now. An advocate can help: call ' + CALL + ' or email ' + MAIL + '.', ['Request a callback', 'Your services']);
      });
  }

  /* ------------------------------------------------------------------ */
  /* Mount                                                               */
  /* ------------------------------------------------------------------ */
  function mount() {
    document.body.appendChild(host);
    buildLauncher();
    if (state.open) open();
    else if (cfg.teaser && !state.teaserSeen) setTimeout(showTeaser, cfg.teaserDelay);
    // Public API: window.VACChat.open() — e.g. wire to "Talk to an Advocate" buttons
    window.VACChat = {
      open: open, close: close, reset: reset,
      startEligibility: function () { open(); startFlow('eligibility'); },
      startCallback: function () { open(); startFlow('callback'); }
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
