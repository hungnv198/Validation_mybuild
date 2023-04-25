const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
function Validation(objects){
    
    // Lấy form tương ứng trong objects
    var formElement = $(objects.form);
    // Lưu các rule trong form vào một object
    var selectRules = {}
    // Nếu như có đối tượng form tương ứng
    if(formElement){
        // Xử lý hành động submit form
        formElement.onsubmit = (event) => {
            // Tạo flag để check lỗi
            var isFormValid = true;
            // Loại bỏ hành vi mặc định của submit form
            event.preventDefault();
            // Nhấn submit để validate
            objects.rules.forEach((rule) =>{
                // ứng với mỗi selector sẽ lấy các thẻ input
                var inputElement = $(rule.selector);
                // Validate luôn
                var isValid = validate(inputElement, rule);
                if(isValid) {
                    isFormValid = false;
                } else {
                    isFormValid = true;
                }
            });
            // Submit form
            if(isFormValid) {
                // Submit form bằng JavaScript
                if(typeof objects.onSubmit === 'function') {
                    // Chọn các element có thuộc tính name
                    var dataInputs = formElement.querySelectorAll('[name]');
                    // Convert sang mảng, xử lý các element
                    var formValueInputs = Array.from(dataInputs).reduce((datas, currentInput) => {
                        // Xử lý các loại input khác nhau
                        switch(currentInput.type){
                            // input là radio
                            case 'radio':
                                if(currentInput.checked){
                                    datas[currentInput.name] = currentInput.value;
                                }
                                break;
                            // input là checkbox
                            case 'checkbox':
                                if(!Array.isArray(datas[currentInput.name])){
                                    datas[currentInput.name] = [];
                                }
                                if(currentInput.checked){
                                    datas[currentInput.name].push(currentInput.value);
                                }
                                break;
                            // input là file
                            case 'file':
                                datas[currentInput.name] = currentInput.files;
                                break;
                            default:
                                datas[currentInput.name] = currentInput.value;
                        }
                        return datas;
                    }, {})
                    objects.onSubmit(formValueInputs);
                } else {
                    // submit form bằng phương thức mặc định
                    formElement.submit();
                }
            } else {
                console.log("Có lỗi");
            }
        }
        // Lọc kết quả lấy các rule trong form
        objects.rules.forEach((rule) => {
            // Lưu tất cả các rule tương ứng vs các rule.selector
            if(Array.isArray(selectRules[rule.selector])){
                selectRules[rule.selector].push(rule.test);
            } else {
                // Với mỗi rule.selector lưu kết quả dưới dạng mảng
                selectRules[rule.selector] = [rule.test];
            }
            // Tại đây lấy được: rule.selector
            // Lấy thẻ input tương ứng
            var inputElements = $$(rule.selector)
            Array.from(inputElements).forEach((inputElement) => {
                inputElement.onblur = () => {
                    validate(inputElement, rule);
                };
                inputElement.oninput = () => {
                    var inputParent = getParent(inputElement, objects.formGroup);
                    inputParent.classList.remove('active');
                };
            })
            
        })
    }
    // Hàm validate giá trị của input
    var validate = (inputElement, rule) => {
        // Lấy ra thẻ cha của input
        var inputParent = getParent(inputElement, objects.formGroup);
        var errorElement = inputParent.querySelector(objects.errorForm);
        var errorMessage;
        // Lấy các rule được lưu trong mảng tương ứng với mỗi selector
        var ruleArray = selectRules[rule.selector];
        // Lặp qua các rule để validate
        for(var i = 0; i< ruleArray.length; i++) {
            switch(inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = ruleArray[i](formElement.querySelector(rule.selector + ':checked'));
                    break;
                default:
                    errorMessage = ruleArray[i](inputElement.value);
            }
            
            // Nếu có lỗi: thoát khỏi vòng lặp
            if(errorMessage) break;
        };
        if(errorMessage){
            errorElement.innerHTML = errorMessage;
            inputParent.classList.add('active');
        } else {
            inputParent.classList.remove('active');
            errorElement.innerHTML = '';
        }
        // Trả ra kết quả lỗi/ không có lỗi
        return !!errorMessage;
    };
    // Hàm getparent của một element
    var getParent = (element, selector) => {
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            } else {
                element = element.parentElement;
            }
        }
    };
    
}
//Nguyên tắc của các rule:
//1. Khi có lỗi: trả ra message lỗi
//2. Khi không có lỗi: Trả ra undefined
Validation.isRequired = (selector) =>{
    return {
        selector: selector,
        test : (value) => {
            return value ? undefined : "Vui lòng nhập trường này";
        }
    }
}
// Xác thực Email
Validation.isEmail = (selector) =>{
    return {
        selector: selector,
        test : (value) => {
            // Khởi tạo giá trị biểu thức chính quy
            var regexEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return regexEmail.test(value) ? undefined : "Giá trị nhập vào phải là email"
        }
    }
}
// Xác thực độ dài giá trị
Validation.minLength = (selector, min) =>{
    return {
        selector: selector,
        test : (value) => {
            // Xác thực, điều kiện cho hàm min length
            return value.length >= min ? undefined : `Vui lòng nhập lớn hơn ${min} kí tự`
        }
    }
}
// Xác thực mật khẩu
Validation.isConfirmPassword = (selector, getPassWord) => {
    return {
        selector: selector,
        test : (value) => {
            // Xác thực giá trị mật khẩu
            return value === getPassWord() ? undefined : `Mật khẩu nhập lại không chính xác`
        }
    }
}
