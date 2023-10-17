// -- Answer 1
// Relationship between Student and Class là One-To-Many. Một Class có thể có nhiều Student nhưng một sinh viên chỉ có thể thuooc về một Class.

// -- Answer 2
// Primary key of Result table is student_id

// -- Answer 3

// SELECT Class.teacher, COUNT(Student.id) as numStudents
// from Class 
// LEFT JOIN Student  ON Class.id = Student.class_id
// WHERE Class.name = '12C'
// GROUP BY Class.teacher;
function convertCardToNumber(cardStr) {
     const cards = {'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14};
return cards[cardStr] || parseInt(cardStr);
}

function result(NumberOutPut, cards) {

    const suits = {'H': [], 'D': [], 'C': [], 'S': []};

    for (let i = 0; i < NumberOutPut; ++i) {

        const num = convertCardToNumber(cards[i][0]);

        const suit = cards[i][1];

        suits[suit].push(num);

    }

    let lengthMax = 0;

    for (var suit in suits) {

        suits[suit].sort(function(a, b) { return a - b; });

        var currentLength = 1;

        for (var i = 1; i < suits[suit].length; ++i) {

            if (suits[suit][i] === suits[suit][i - 1] + 1) {

                currentLength++;

                lengthMax = Math.max(lengthMax, currentLength);

            } else {

                currentLength = 1;

            }

        }

    }

    return lengthMax < 3 ? 0 : lengthMax;

}



console.log(result(3, ["3H", "4H", "5H"]));
console.log(result(4, ["3H","4D","5S","6C"]));



function result(n, m, prices) {

    let count = 0;

    let result = 0;

    for (let i = 0; i < n - 1; i++) {

        if (prices[i] > prices[i + 1]) {

            count++;

            if (count === m) {

                result = prices[i + 1];

                break;

            }

        } else {

            count = 0;

        }

    }
    return result;

}

//Test cases

console.log(result(6, 2, [100, 90, 85, 95, 92, 100]));  // 85

console.log(result(6, 3, [20, 10, 30, 40, 50, 60]));   // 0


select MAX(salary) as 3_Highest_Salary

from employee

where salary NOT IN (

    select MAX(salary)

    from employee

    where salary NOT IN (

        select MAX(salary)

        from employee

    )

)