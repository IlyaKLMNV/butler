// Читаем уже отправленные email из localStorage
let sentEmails = new Set(JSON.parse(localStorage.getItem('sentEmails') || '[]'));

// Функция отправки email
async function sendEmail(email, name) {
  return new Promise((resolve, reject) => {
      setTimeout(() => {
          if (Math.floor(Math.random() * 10) > 0) {
              console.log(`отправлено на ${email} (${name})`);
              resolve(Math.floor(Math.random() * 100000));
          } else {
              console.error(`не отправлено на ${email} (${name})`);
              reject(new Error('не отправлено'));
          }
      }, Math.floor(Math.random() * (2000 - 100) + 100));
  });
}

// Функция рассылки
async function sendEmails(emails) {
    let results = [];
    
    // Функция ограничения скорости (60 писем в минуту)
    const throttle = (fn, delay) => {
        let lastCall = 0;
        return async function (...args) {
            const now = Date.now();
            if (now - lastCall < delay) {
                await new Promise(resolve => setTimeout(resolve, delay - (now - lastCall)));
            }
            lastCall = Date.now();
            return fn(...args);
        };
    };

    const sendEmailWithThrottle = throttle(sendEmail, 1000 * 60 / 60); // Ограничение 60 писем в минуту

    for (let { email, fio } of emails) {
        const name = fio || 'клиент';

        // Проверяем, что email ещё не отправлялся
        if (!sentEmails.has(email)) {
            try {
                const result = await sendEmailWithThrottle(email, name);
                sentEmails.add(email); // Добавляем email в отправленные
                results.push({ email, name, status: 'sent', result });
            } catch (error) {
                results.push({ email, name, status: 'failed', error: error.message });
            }
        } else {
            results.push({ email, name, status: 'already sent' });
        }
    }

    // Сохраняем данные об отправленных письмах в localStorage
    localStorage.setItem('sentEmails', JSON.stringify(Array.from(sentEmails)));

    return results;
}

// Пример использования
const emails = [
  { fio: 'Иванов Иван Иванович', email: 'example1@email.com' },
  { fio: 'Иванов И И', email: 'example2@email.com' },
  { fio: 'Ли Тян', email: 'example3@email.com' },
  { fio: '', email: 'example4@email.com' },
  { fio: 'Петров Петя', email: 'example5@email.com' },
  { fio: 'Вася Петров', email: 'example5@email.com' },
  { fio: 'Петров Вася', email: 'example999@email.com' },
];

sendEmails(emails).then(results => {
    console.log('Результаты рассылки:', results);
});
