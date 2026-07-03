export function calculateLoan(interestRate, loanAmount, loanDuration) {
    console.log(`Calculating loan with interest rate: ${interestRate}%, amount: ${loanAmount}, duration: ${loanDuration} months`);
    const monthlyInterestRate = interestRate / 100 / 12;
    let monthlyPayment;
    if (monthlyInterestRate === 0) {
        monthlyPayment = loanAmount / loanDuration;
    } else {
        console.log(`Zinsen`);
        monthlyPayment = Math.round((loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanDuration)) / (Math.pow(1 + monthlyInterestRate, loanDuration) - 1) + Number.EPSILON) * 100) / 100;
    };
    const totalPayment = Math.round((monthlyPayment * loanDuration + Number.EPSILON) * 100) / 100;
    const totalInterest = Math.round((totalPayment - loanAmount + Number.EPSILON) * 100) / 100;
    return {
        loanAmount,
        loanDuration,
        interestRate,
        monthlyPayment,
        totalPayment,
        totalInterest
    };
}