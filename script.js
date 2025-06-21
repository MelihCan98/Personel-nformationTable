document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const personForm = document.getElementById('personForm');
    const personTableBody = document.getElementById('personTableBody');
    const searchInput = document.getElementById('searchInput');
    const cancelBtn = document.getElementById('cancelBtn');
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const deletePersonInfo = document.getElementById('deletePersonInfo');
    
    // Data storage
    let persons = JSON.parse(localStorage.getItem('persons')) || [];
    let currentPersonId = null;
    
    // Initialize the app
    renderPersonTable(persons);
    
    // Form submission
    personForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            const personData = {
                name: document.getElementById('name').value.trim(),
                tc: document.getElementById('tc').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                email: document.getElementById('email').value.trim()
            };
            
            if (currentPersonId) {
                // Update existing person
                const index = persons.findIndex(p => p.id == currentPersonId);
                if (index !== -1) {
                    persons[index] = { ...persons[index], ...personData };
                }
            } else {
                // Add new person
                const newPerson = {
                    id: Date.now(), // Simple ID generation
                    ...personData
                };
                persons.unshift(newPerson);
            }
            
            saveToLocalStorage();
            resetForm();
            renderPersonTable(persons);
        }
    });
    
    // Cancel button
    cancelBtn.addEventListener('click', resetForm);
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredPersons = persons.filter(person => 
            person.name.toLowerCase().includes(searchTerm) ||
            person.tc.includes(searchTerm) ||
            person.phone.includes(searchTerm) ||
            (person.email && person.email.toLowerCase().includes(searchTerm))
        );
        renderPersonTable(filteredPersons);
    });
    
    // Delete confirmation
    confirmDeleteBtn.addEventListener('click', function() {
        if (currentPersonId) {
            persons = persons.filter(p => p.id != currentPersonId);
            saveToLocalStorage();
            renderPersonTable(persons);
            deleteModal.hide();
            resetForm();
        }
    });
    
    // Form validation
    function validateForm() {
        let isValid = true;
        const nameInput = document.getElementById('name');
        const tcInput = document.getElementById('tc');
        const phoneInput = document.getElementById('phone');
        const emailInput = document.getElementById('email');
        
        // Name validation
        if (nameInput.value.trim().length < 3) {
            nameInput.classList.add('is-invalid');
            isValid = false;
        } else {
            nameInput.classList.remove('is-invalid');
        }
        
        // TC validation (11 digits)
        const tcRegex = /^\d{11}$/;
        if (!tcRegex.test(tcInput.value)) {
            tcInput.classList.add('is-invalid');
            isValid = false;
        } else {
            tcInput.classList.remove('is-invalid');
        }
        
        // Phone validation (10 digits for Turkey)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phoneInput.value)) {
            phoneInput.classList.add('is-invalid');
            isValid = false;
        } else {
            phoneInput.classList.remove('is-invalid');
        }
        
        // Email validation (optional)
        if (emailInput.value && !validateEmail(emailInput.value)) {
            emailInput.classList.add('is-invalid');
            isValid = false;
        } else {
            emailInput.classList.remove('is-invalid');
        }
        
        return isValid;
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Render person table
    function renderPersonTable(data) {
        personTableBody.innerHTML = '';
        
        if (data.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="6" class="text-center">Kayıt bulunamadı</td>';
            personTableBody.appendChild(tr);
            return;
        }
        
        data.forEach(person => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${person.id}</td>
                <td>${person.name}</td>
                <td>${formatTC(person.tc)}</td>
                <td>${formatPhone(person.phone)}</td>
                <td>${person.email || '-'}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-warning me-1 edit-btn" data-id="${person.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${person.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            personTableBody.appendChild(tr);
        });
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const personId = parseInt(this.getAttribute('data-id'));
                editPerson(personId);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const personId = parseInt(this.getAttribute('data-id'));
                showDeleteModal(personId);
            });
        });
    }
    
    // Edit person
    function editPerson(id) {
        const person = persons.find(p => p.id === id);
        if (person) {
            currentPersonId = person.id;
            document.getElementById('personId').value = person.id;
            document.getElementById('name').value = person.name;
            document.getElementById('tc').value = person.tc;
            document.getElementById('phone').value = person.phone;
            document.getElementById('email').value = person.email || '';
            
            cancelBtn.style.display = 'inline-block';
            document.getElementById('personForm').scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Show delete confirmation modal
    function showDeleteModal(id) {
        const person = persons.find(p => p.id === id);
        if (person) {
            currentPersonId = person.id;
            deletePersonInfo.textContent = `${person.name} (${formatTC(person.tc)})`;
            deleteModal.show();
        }
    }
    
    // Reset form
    function resetForm() {
        personForm.reset();
        currentPersonId = null;
        document.getElementById('personId').value = '';
        cancelBtn.style.display = 'none';
        
        // Remove validation classes
        document.querySelectorAll('.is-invalid, .is-valid').forEach(el => {
            el.classList.remove('is-invalid', 'is-valid');
        });
    }
    
    // Save to localStorage
    function saveToLocalStorage() {
        localStorage.setItem('persons', JSON.stringify(persons));
    }
    
    // Format TC for display
    function formatTC(tc) {
        return tc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1 $2 $3 $4');
    }
    
    // Format phone for display
    function formatPhone(phone) {
        return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2 $3');
    }
    
    // Input masks
    document.getElementById('tc').addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '').slice(0, 11);
    });
    
    document.getElementById('phone').addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '').slice(0, 10);
    });
});