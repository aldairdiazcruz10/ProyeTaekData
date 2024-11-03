document.getElementById('logoutBtn').addEventListener('click', function() {
    window.location.href = "{{ url_for('logout') }}";});