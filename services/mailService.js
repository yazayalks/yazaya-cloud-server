// import emailjs from '@emailjs/browser'
// import { SMTPClient } from 'emailjs';
// class MailService {
//
//     async sendActivationMail(to, link) {
//         console.log("sendActivationMail")
//         let templateParams = {
//             to: to,
//             link: link
//         };
//
//         console.log(to, link)
//         emailjs.send(process.env.SERVICE_ID, process.env.TEMPLATE_ID, templateParams, process.env.PUBLIC_KEY)
//             .then(function(response) {
//                 console.log('SUCCESS!', response.status, response.text);
//             }, function(error) {
//                 console.log('FAILED...', error);
//             });
//     }
// }
// export default new MailService();

