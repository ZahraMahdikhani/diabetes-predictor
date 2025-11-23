// app.js: frontend validation + AJAX (optional)
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('predictForm');

  if (!form) return;

  form.addEventListener('submit', function (e) {
    // basic HTML5 validation will run; here we can add extra checks
    if (!form.checkValidity()) {
      // let browser show messages
      return;
    }

    // Optionally, intercept submission and call API via fetch to get JSON (AJAX)
    // Uncomment block below to use AJAX and prevent page reload

    /*
    e.preventDefault();
    const formData = new FormData(form);
    const payload = {};
    for (let pair of formData.entries()) {
      payload[pair[0]] = pair[1];
    }

    fetch('/api/predict', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    }).then(r => r.json()).then(data => {
      if (data.error || data.errors) {
        alert('خطا: ' + JSON.stringify(data));
        return;
      }
      // update result area and chart
      document.getElementById('probText').innerText = data.prob.toFixed(4);
      // update chart
      window.probChart.data.datasets[0].data = [data.prob, 1 - data.prob];
      window.probChart.update();
      // show download link etc - we can redirect to /? after saving
      window.location.href = '/';
    }).catch(err => {
      console.error(err);
      alert(' خطا در تماس با سرور ');
    });
    */
  });
});
