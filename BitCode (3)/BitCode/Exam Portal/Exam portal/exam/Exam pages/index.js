document.addEventListener('DOMContentLoaded', function() {
    // Get all the nav options
    const navOptions = document.querySelectorAll('.nav-option');
    
    // Get all sections
    const sections = document.querySelectorAll('.section');
    
    // Function to hide all sections
    function hideAllSections() {
        sections.forEach(section => {
            section.style.display = 'none';  // Hide each section
        });
    }

    // Initially hide all sections except the first one (Exams)
    hideAllSections();
    document.getElementById('exams').style.display = 'block';  // Show the Exams section by default

    // Add click event listeners to each nav option
    navOptions.forEach(option => {
        option.addEventListener('click', function() {
            hideAllSections();  // Hide all sections first

            // Get the text inside the clicked option (Exams, Results, etc.)
            const selectedOption = this.querySelector('h3').innerText.toLowerCase();

            // Show the corresponding section based on the clicked option
            if (selectedOption === 'exams') {
                document.getElementById('exams').style.display = 'block';
            } else if (selectedOption === 'results') {
                document.getElementById('results').style.display = 'block';
            } else if (selectedOption === 'activity') {
                document.getElementById('activity').style.display = 'block';
            } else if (selectedOption === 'logout') {
                document.getElementById('logout').style.display = 'block';
            }
        });
    });
});
