// KIDD'S ZONE - Payment Page JavaScript with QR Code Generation
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== PAYMENT FORM FUNCTIONALITY =====
    const paymentForm = document.getElementById('paymentForm');
    const generateBtn = document.getElementById('generateBtn');
    const upiPaymentBox = document.getElementById('upiPaymentBox');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const copyUpiBtn = document.getElementById('copyUpiBtn');
    const paymentDoneBtn = document.getElementById('paymentDoneBtn');
    const downloadReceiptBtn = document.getElementById('downloadReceiptBtn');
    const successModal = document.getElementById('successModal');
    const termsModal = document.getElementById('termsModal');
    const termsLink = document.getElementById('termsLink');
    const termsClose = document.getElementById('termsClose');
    const modalClose = document.getElementById('modalClose');
    const printReceiptBtn = document.getElementById('printReceiptBtn');
    const newPaymentBtn = document.getElementById('newPaymentBtn');
    const goHomeBtn = document.getElementById('goHomeBtn');
    const agreeTermsBtn = document.getElementById('agreeTermsBtn');
    
    // School UPI ID - CHANGE THIS TO YOUR SCHOOL'S ACTUAL UPI ID
    const SCHOOL_UPI_ID = "kiddszoneschool@okhdfcbank";
    
    // Display elements
    const displayStudentName = document.getElementById('displayStudentName');
    const displayClass = document.getElementById('displayClass');
    const displayPurpose = document.getElementById('displayPurpose');
    const displayAmount = document.getElementById('displayAmount');
    const paymentIdElement = document.getElementById('paymentId');
    const remarksIdElement = document.getElementById('remarksId');
    const schoolUpiIdElement = document.getElementById('schoolUpiId');
    const successPaymentId = document.getElementById('successPaymentId');
    const successAmount = document.getElementById('successAmount');
    const successStudent = document.getElementById('successStudent');
    
    // QR Code instance
    let qrCodeInstance = null;
    
    // Initialize with school UPI ID
    schoolUpiIdElement.textContent = SCHOOL_UPI_ID;
    
    // Store current payment data
    let currentPaymentData = null;
    
    // Generate Payment ID
    function generatePaymentId() {
        const date = new Date();
        const timestamp = date.getTime().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `KZ${month}${day}${timestamp}${random}`;
    }
    
    // Generate QR Code using QRCode.js library
    function generateQRCode(paymentId, amount, studentName) {
        // Clear previous QR code
        qrCodeContainer.innerHTML = '';
        
        // Create UPI payment string
        const upiString = `upi://pay?pa=${SCHOOL_UPI_ID}&pn=KIDD'S ZONE SCHOOL&am=${amount}&tn=Fee Payment for ${encodeURIComponent(studentName)} (ID: ${paymentId})&cu=INR`;
        
        // Create QR code container
        const qrDiv = document.createElement('div');
        qrDiv.id = 'qrCode';
        qrDiv.style.cssText = `
            width: 180px;
            height: 180px;
            margin: 0 auto;
        `;
        qrCodeContainer.appendChild(qrDiv);
        
        // Generate QR code
        if (qrCodeInstance) {
            qrCodeInstance.clear();
        }
        
        qrCodeInstance = new QRCode(qrDiv, {
            text: upiString,
            width: 180,
            height: 180,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        // Add overlay info
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            text-align: center;
            margin-top: 15px;
        `;
        overlay.innerHTML = `
            <p style="font-weight: 600; color: #333; margin-bottom: 5px; font-size: 1.1rem;">Scan to Pay</p>
            <p style="color: #666; font-size: 0.9rem; margin-bottom: 3px;">Amount: ₹${parseInt(amount).toLocaleString('en-IN')}</p>
            <p style="color: #888; font-size: 0.8rem; font-family: monospace;">ID: ${paymentId}</p>
        `;
        qrCodeContainer.appendChild(overlay);
        
        return upiString;
    }
    
    // Copy UPI ID to clipboard
    if (copyUpiBtn) {
        copyUpiBtn.addEventListener('click', function() {
            navigator.clipboard.writeText(SCHOOL_UPI_ID).then(() => {
                const originalHTML = this.innerHTML;
                const originalBg = this.style.background;
                
                this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                this.style.background = '#06D6A0';
                
                setTimeout(() => {
                    this.innerHTML = originalHTML;
                    this.style.background = originalBg;
                }, 2000);
                
                // Show toast notification
                showToast('UPI ID copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = SCHOOL_UPI_ID;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                showToast('UPI ID copied!');
            });
        });
    }
    
    // Handle form submission
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                studentName: document.getElementById('studentName').value.trim(),
                parentName: document.getElementById('parentName').value.trim(),
                parentPhone: document.getElementById('parentPhone').value.trim(),
                studentClass: document.getElementById('studentClass').value,
                paymentPurpose: document.getElementById('paymentPurpose').value,
                amount: document.getElementById('amount').value,
                paymentNote: document.getElementById('paymentNote').value.trim(),
                paymentId: generatePaymentId(),
                timestamp: new Date().toISOString()
            };
            
            // Validate amount
            const amountNum = parseFloat(formData.amount);
            if (isNaN(amountNum) || amountNum <= 0) {
                showToast('Please enter a valid amount greater than ₹0', 'error');
                document.getElementById('amount').focus();
                return;
            }
            
            // Validate phone number
            const phoneRegex = /^[6-9]\d{9}$/;
            if (!phoneRegex.test(formData.parentPhone)) {
                showToast('Please enter a valid 10-digit Indian mobile number', 'error');
                document.getElementById('parentPhone').focus();
                return;
            }
            
            // Validate all required fields
            if (!formData.studentName || !formData.parentName || !formData.studentClass || !formData.paymentPurpose) {
                showToast('Please fill all required fields', 'error');
                return;
            }
            
            // Format amount to integer (UPI doesn't support decimals well)
            formData.amount = Math.round(amountNum);
            
            // Store payment data
            currentPaymentData = formData;
            
            // Update display
            displayStudentName.textContent = formData.studentName;
            displayClass.textContent = formData.studentClass;
            displayPurpose.textContent = formData.paymentPurpose;
            displayAmount.textContent = `₹ ${formData.amount.toLocaleString('en-IN')}`;
            paymentIdElement.textContent = formData.paymentId;
            remarksIdElement.textContent = formData.paymentId;
            
            // Generate QR code
            generateQRCode(formData.paymentId, formData.amount, formData.studentName);
            
            // Enable payment buttons
            paymentDoneBtn.disabled = false;
            paymentDoneBtn.style.opacity = '1';
            paymentDoneBtn.style.cursor = 'pointer';
            
            // Scroll to payment box with smooth animation
            setTimeout(() => {
                upiPaymentBox.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
            }, 300);
            
            // Highlight payment box
            upiPaymentBox.style.transform = 'translateY(-5px)';
            upiPaymentBox.style.boxShadow = '0 15px 40px rgba(78, 205, 196, 0.25)';
            
            setTimeout(() => {
                upiPaymentBox.style.transform = '';
                upiPaymentBox.style.boxShadow = '';
            }, 1000);
            
            // Show success message
            showToast('Payment request generated! Scan the QR code to pay.');
        });
    }
    
    // Payment Done button
    if (paymentDoneBtn) {
        paymentDoneBtn.addEventListener('click', function() {
            if (!currentPaymentData) {
                showToast('Please generate a payment request first', 'error');
                return;
            }
            
            // Create custom confirmation modal
            const confirmHTML = `
                <div class="confirm-modal">
                    <h3><i class="fas fa-question-circle"></i> Confirm Payment</h3>
                    <p>Have you completed the UPI payment of <strong>₹${currentPaymentData.amount.toLocaleString('en-IN')}</strong>?</p>
                    <div class="confirm-details">
                        <p><strong>Payment ID:</strong> ${currentPaymentData.paymentId}</p>
                        <p><strong>Student:</strong> ${currentPaymentData.studentName}</p>
                    </div>
                    <div class="confirm-buttons">
                        <button class="btn btn-secondary" id="cancelConfirm">No, Not Yet</button>
                        <button class="btn btn-success" id="confirmPayment">Yes, Payment Done</button>
                    </div>
                </div>
            `;
            
            const confirmModal = document.createElement('div');
            confirmModal.className = 'modal active';
            confirmModal.innerHTML = confirmHTML;
            document.body.appendChild(confirmModal);
            
            // Handle confirmation
            document.getElementById('confirmPayment').addEventListener('click', function() {
                // Save payment to localStorage (simulating backend storage)
                savePaymentToStorage(currentPaymentData);
                
                // Update success modal
                successPaymentId.textContent = currentPaymentData.paymentId;
                successAmount.textContent = `₹ ${currentPaymentData.amount.toLocaleString('en-IN')}`;
                successStudent.textContent = `${currentPaymentData.studentName} (${currentPaymentData.studentClass})`;
                
                // Remove confirmation modal
                document.body.removeChild(confirmModal);
                
                // Show success modal
                successModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Enable receipt download
                downloadReceiptBtn.disabled = false;
                downloadReceiptBtn.style.opacity = '1';
                downloadReceiptBtn.style.cursor = 'pointer';
                
                // Show success message
                showToast('Payment submitted successfully!');
            });
            
            // Handle cancel
            document.getElementById('cancelConfirm').addEventListener('click', function() {
                document.body.removeChild(confirmModal);
                showToast('Please complete the payment first', 'info');
            });
            
            // Close on background click
            confirmModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    document.body.removeChild(confirmModal);
                }
            });
        });
    }
    
    // Download Receipt button
    if (downloadReceiptBtn) {
        downloadReceiptBtn.addEventListener('click', function() {
            if (!currentPaymentData) {
                showToast('No payment data available', 'error');
                return;
            }
            
            // Generate receipt HTML
            const receiptHTML = generateReceiptHTML(currentPaymentData);
            
            // Create blob and download
            const blob = new Blob([receiptHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `KiddsZone_Receipt_${currentPaymentData.paymentId}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showToast('Receipt downloaded successfully!');
        });
    }
    
    // Terms modal
    if (termsLink) {
        termsLink.addEventListener('click', function(e) {
            e.preventDefault();
            termsModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Agree to terms button
    if (agreeTermsBtn) {
        agreeTermsBtn.addEventListener('click', function() {
            termsModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            document.getElementById('paymentForm').querySelector('input[type="checkbox"]').checked = true;
        });
    }
    
    // Close modals
    const closeModal = (modal) => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };
    
    if (termsClose) {
        termsClose.addEventListener('click', () => closeModal(termsModal));
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', () => closeModal(successModal));
    }
    
    // Close modal when clicking outside
    [successModal, termsModal].forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });
    
    // Modal buttons
    if (printReceiptBtn) {
        printReceiptBtn.addEventListener('click', function() {
            // Generate print-friendly receipt
            const printWindow = window.open('', '_blank');
            printWindow.document.write(generateReceiptHTML(currentPaymentData));
            printWindow.document.close();
            printWindow.focus();
            
            setTimeout(() => {
                printWindow.print();
            }, 250);
        });
    }
    
    if (newPaymentBtn) {
        newPaymentBtn.addEventListener('click', function() {
            closeModal(successModal);
            resetPaymentForm();
        });
    }
    
    if (goHomeBtn) {
        goHomeBtn.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    // Reset payment form
    function resetPaymentForm() {
        paymentForm.reset();
        
        // Reset display
        displayStudentName.textContent = '--';
        displayClass.textContent = '--';
        displayPurpose.textContent = '--';
        displayAmount.textContent = '₹ 0';
        paymentIdElement.textContent = '--';
        remarksIdElement.textContent = '--';
        
        // Reset QR code
        qrCodeContainer.innerHTML = `
            <div class="qr-placeholder">
                <i class="fas fa-qrcode"></i>
                <p>Fill form to generate QR code</p>
            </div>
        `;
        
        // Clear QR instance
        if (qrCodeInstance) {
            qrCodeInstance.clear();
            qrCodeInstance = null;
        }
        
        // Disable buttons
        paymentDoneBtn.disabled = true;
        paymentDoneBtn.style.opacity = '0.6';
        paymentDoneBtn.style.cursor = 'not-allowed';
        
        downloadReceiptBtn.disabled = true;
        downloadReceiptBtn.style.opacity = '0.6';
        downloadReceiptBtn.style.cursor = 'not-allowed';
        
        // Scroll to form
        setTimeout(() => {
            paymentForm.scrollIntoView({ behavior: 'smooth' });
        }, 300);
        
        currentPaymentData = null;
        
        // Set default amount placeholder based on today's month
        const today = new Date();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonth = monthNames[today.getMonth()];
        const currentYear = today.getFullYear();
        document.getElementById('paymentNote').placeholder = `E.g., For ${currentMonth} ${currentYear} fee, Roll No. `;
    }
    
    // Save payment to localStorage (simulating database)
    function savePaymentToStorage(paymentData) {
        try {
            const payments = JSON.parse(localStorage.getItem('kiddsZonePayments')) || [];
            payments.push({
                ...paymentData,
                status: 'pending',
                submittedAt: new Date().toISOString(),
                verified: false
            });
            
            localStorage.setItem('kiddsZonePayments', JSON.stringify(payments));
            console.log('Payment saved:', paymentData.paymentId);
            
            // In a real implementation, you would send this to a backend server
            // simulateServerSubmission(paymentData);
            
            return true;
        } catch (error) {
            console.error('Error saving payment:', error);
            showToast('Error saving payment data', 'error');
            return false;
        }
    }
    
    // Show toast notification
    function showToast(message, type = 'success') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast-notification');
        existingToasts.forEach(toast => toast.remove());
        
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .toast-notification {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background: ${type === 'success' ? '#06D6A0' : type === 'error' ? '#EF476F' : '#4ECDC4'};
                color: white;
                padding: 15px 20px;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                z-index: 4000;
                animation: slideUpToast 0.3s ease forwards;
                max-width: 90%;
                width: auto;
                min-width: 300px;
                text-align: center;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .toast-content {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                font-weight: 500;
                font-size: 0.95rem;
            }
            
            .toast-content i {
                font-size: 1.2rem;
            }
            
            @keyframes slideUpToast {
                to {
                    transform: translateX(-50%) translateY(0);
                }
            }
            
            @media (max-width: 480px) {
                .toast-notification {
                    min-width: 250px;
                    padding: 12px 16px;
                    font-size: 0.9rem;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideUpToast 0.3s ease reverse forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
                if (style.parentNode) {
                    style.remove();
                }
            }, 300);
        }, 3000);
    }
    
    // Generate receipt HTML
    function generateReceiptHTML(paymentData) {
        const date = new Date(paymentData.timestamp).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Payment Receipt - KIDD'S ZONE</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Poppins', sans-serif; 
            margin: 40px; 
            color: #333;
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
            min-height: 100vh;
        }
        .receipt { 
            max-width: 600px; 
            margin: 0 auto; 
            border: 2px solid #4ECDC4; 
            border-radius: 20px; 
            padding: 40px; 
            background: white;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
            position: relative;
            overflow: hidden;
        }
        .receipt::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 5px;
            background: linear-gradient(90deg, #FF6B8B, #4ECDC4, #FFD166, #9D6BFF);
        }
        .header { 
            text-align: center; 
            margin-bottom: 40px;
            position: relative;
        }
        .header h1 { 
            color: #FF6B8B; 
            margin: 0; 
            font-size: 32px; 
            font-weight: 900;
            margin-bottom: 10px;
        }
        .header p { 
            color: #666; 
            margin: 5px 0; 
            font-size: 1.1rem;
        }
        .school-info {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 12px;
            border-left: 4px solid #4ECDC4;
        }
        .details { 
            margin: 30px 0; 
        }
        .row { 
            display: flex; 
            justify-content: space-between; 
            padding: 14px 0; 
            border-bottom: 1px solid #eee; 
            align-items: center;
        }
        .row:last-child { 
            border-bottom: none; 
        }
        .label { 
            color: #666; 
            font-weight: 500;
            font-size: 0.95rem;
        }
        .value { 
            font-weight: 600; 
            color: #2D3047; 
            text-align: right;
            max-width: 60%;
            word-break: break-word;
        }
        .amount-row { 
            background: linear-gradient(135deg, #f0f7ff 0%, #e4f9ff 100%); 
            padding: 20px; 
            border-radius: 12px; 
            margin: 25px 0; 
            border: 2px solid #b3d4ff;
        }
        .amount-row .row {
            border: none;
            padding: 0;
        }
        .amount-row .label { 
            font-size: 1.3rem; 
            color: #2D3047;
        }
        .amount-row .value { 
            font-size: 2rem; 
            color: #06D6A0; 
            font-weight: 900;
        }
        .footer { 
            text-align: center; 
            margin-top: 50px; 
            color: #666; 
            font-size: 0.9rem; 
            border-top: 2px dashed #ddd; 
            padding-top: 25px; 
        }
        .watermark { 
            position: absolute; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%) rotate(-45deg); 
            font-size: 120px; 
            color: rgba(78, 205, 196, 0.1); 
            z-index: -1; 
            font-weight: 900;
            white-space: nowrap;
        }
        .signature { 
            margin-top: 60px; 
            text-align: right; 
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        .signature p { 
            margin-bottom: 8px;
            color: #666;
        }
        .signature-line {
            width: 200px;
            height: 1px;
            background: #333;
            margin: 25px 0 10px;
            display: inline-block;
        }
        .security-note {
            background: #fff9e6;
            border-radius: 12px;
            padding: 15px;
            margin-top: 20px;
            border-left: 4px solid #FFD166;
            font-size: 0.85rem;
        }
        .payment-status {
            display: inline-block;
            padding: 6px 15px;
            background: #06D6A0;
            color: white;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9rem;
            margin-top: 10px;
        }
        @media print { 
            body { 
                margin: 0; 
                padding: 20px; 
                background: white;
            }
            .receipt {
                box-shadow: none;
                border: 1px solid #ddd;
                padding: 30px;
            }
            .watermark {
                opacity: 0.05;
            }
        }
        @media (max-width: 768px) {
            body {
                margin: 20px;
            }
            .receipt {
                padding: 25px;
                border-radius: 16px;
            }
            .header h1 {
                font-size: 28px;
            }
            .amount-row .value {
                font-size: 1.8rem;
            }
            .row {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }
            .value {
                text-align: left;
                max-width: 100%;
            }
        }
        @media (max-width: 480px) {
            body {
                margin: 10px;
            }
            .receipt {
                padding: 20px;
            }
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="watermark">KIDD'S ZONE</div>
        
        <div class="header">
            <h1>🎨 KIDD'S ZONE</h1>
            <p>A Unit of Complete Study</p>
            <p>Payment Acknowledgment Receipt</p>
            <div class="payment-status">PAYMENT SUBMITTED</div>
        </div>
        
        <div class="school-info">
            <p style="text-align: center; margin-bottom: 0;">
                <strong>Address:</strong> 123 Learning Street, Education City<br>
                <strong>Contact:</strong> +91-XXXXXXXXXX | accounts@kiddszone.edu
            </p>
        </div>
        
        <div class="details">
            <div class="row">
                <span class="label">Payment ID:</span>
                <span class="value" style="font-family: monospace;">${paymentData.paymentId}</span>
            </div>
            <div class="row">
                <span class="label">Date & Time:</span>
                <span class="value">${date}</span>
            </div>
            <div class="row">
                <span class="label">Student Name:</span>
                <span class="value">${paymentData.studentName}</span>
            </div>
            <div class="row">
                <span class="label">Class:</span>
                <span class="value">${paymentData.studentClass}</span>
            </div>
            <div class="row">
                <span class="label">Parent Name:</span>
                <span class="value">${paymentData.parentName}</span>
            </div>
            <div class="row">
                <span class="label">Parent Phone:</span>
                <span class="value">${paymentData.parentPhone}</span>
            </div>
            <div class="row">
                <span class="label">Payment Purpose:</span>
                <span class="value">${paymentData.paymentPurpose}</span>
            </div>
            <div class="row">
                <span class="label">Payment Note:</span>
                <span class="value">${paymentData.paymentNote || 'N/A'}</span>
            </div>
            <div class="amount-row">
                <div class="row">
                    <span class="label">Amount Paid:</span>
                    <span class="value">₹ ${parseInt(paymentData.amount).toLocaleString('en-IN')}</span>
                </div>
            </div>
            <div class="row">
                <span class="label">Payment Mode:</span>
                <span class="value">UPI (${SCHOOL_UPI_ID})</span>
            </div>
            <div class="row">
                <span class="label">Transaction Status:</span>
                <span class="value" style="color: #06D6A0;">Submitted for Verification</span>
            </div>
        </div>
        
        <div class="security-note">
            <p><strong>🔒 Secure Transaction:</strong> This payment was processed through encrypted UPI channels. Your financial details are never stored.</p>
        </div>
        
        <div class="signature">
            <div class="signature-line"></div>
            <p><strong>School Authority Signature</strong></p>
            <p>KIDD'S ZONE - A Unit of Complete Study</p>
            <p>Date: ${new Date().toLocaleDateString('en-IN')}</p>
        </div>
        
        <div class="footer">
            <p><strong>📋 Important Information:</strong></p>
            <p>• This is a payment acknowledgment receipt.</p>
            <p>• Official fee receipt will be issued after payment verification (within 48 hours).</p>
            <p>• Please keep this receipt for your records.</p>
            <p>• For any queries, contact accounts department.</p>
            <p style="margin-top: 20px; color: #999; font-size: 0.8rem;">
                Receipt generated electronically on ${new Date().toLocaleString('en-IN')}
            </p>
        </div>
    </div>
</body>
</html>`;
    }
    
    // Initialize page
    function initPaymentPage() {
        console.log('Payment page initialized');
        
        // Set today's date as suggestion for payment note
        const today = new Date();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonth = monthNames[today.getMonth()];
        const currentYear = today.getFullYear();
        document.getElementById('paymentNote').placeholder = `E.g., For ${currentMonth} ${currentYear} fee, Roll No. `;
        
        // Add input validation
        const amountInput = document.getElementById('amount');
        amountInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^0-9]/g, '');
            if (value.length > 8) {
                value = value.substring(0, 8);
            }
            e.target.value = value;
        });
        
        // Add phone validation
        const phoneInput = document.getElementById('parentPhone');
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^0-9]/g, '');
            if (value.length > 10) {
                value = value.substring(0, 10);
            }
            e.target.value = value;
        });
        
        // Add form validation styles
        const inputs = document.querySelectorAll('#paymentForm input, #paymentForm select');
        inputs.forEach(input => {
            input.addEventListener('invalid', function(e) {
                e.preventDefault();
                this.style.borderColor = '#EF476F';
                this.style.boxShadow = '0 0 0 3px rgba(239, 71, 111, 0.15)';
                
                // Show error message
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'This field is required';
                errorMsg.style.cssText = `
                    color: #EF476F;
                    font-size: 0.85rem;
                    margin-top: 5px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                `;
                errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i> This field is required`;
                
                // Remove existing error
                const existingError = this.parentNode.querySelector('.error-message');
                if (existingError) existingError.remove();
                
                this.parentNode.appendChild(errorMsg);
            });
            
            input.addEventListener('input', function() {
                this.style.borderColor = '';
                this.style.boxShadow = '';
                const errorMsg = this.parentNode.querySelector('.error-message');
                if (errorMsg) errorMsg.remove();
            });
        });
    }
    
    // Initialize when DOM is loaded
    initPaymentPage();
});