document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  const submit = document.querySelector('submit')
  const NewRecipents = document.querySelector('#compose-recipients')
  const NewSubject = document.querySelector('#compose-subject')
  const NewBody = document.querySelector('#compose-body')
  
  document.querySelector('#compose-form').onsubmit = () => {
    const recipents = NewRecipents.value;
    const subject = NewSubject.value;
    const body = NewBody.value;

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipents,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        load_mailbox('sent');
    });
    return false;
  }
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      emails.forEach(email => {
        const sender = email.sender
        const subject = email.subject
        const timestamp = email.timestamp
        const read = email.read

        const element = document.createElement('div');
        element.id = "emails";

        if (read === true)
        {
          element.style.backgroundColor = 'grey';
        }

        if (email.archived === true){
          element.innerHTML = `<b>${sender}</b> ${subject} <b><span id = 'timestamp'>${timestamp}</span></b>`

          const button = document.createElement('button')
          button.id = "bttn";
          
          
          button.innerHTML = `Un Archive`;
          button.addEventListener('click', function() {
            unarchive(email.id);
          });
          

          element.addEventListener('click', function() {
              console.log('This element has been clicked!')
              document.querySelector('#emails-view').style.display = 'none';
              document.querySelector('#compose-view').style.display = 'none';
              document.querySelector('#view').style.display = 'block';
              viewEmail(email.id)
          });


          const e = document.getElementById("email");
          if (e != null){
            e.remove();
          }

          document.querySelector('#emails-view').append(element);
          document.querySelector('#emails-view').append(button);
        }

        else{
          element.innerHTML = `<b>${sender}</b> ${subject} <b><span id = 'timestamp'>${timestamp}</span></b>`

          element.addEventListener('click', function() {
              console.log('This element has been clicked!')
              document.querySelector('#emails-view').style.display = 'none';
              document.querySelector('#compose-view').style.display = 'none';
              document.querySelector('#view').style.display = 'block';
              viewEmail(email.id)
          });


          const e = document.getElementById("email");
          if (e != null){
            e.remove();
          }

          document.querySelector('#emails-view').append(element);

          if (mailbox === 'inbox'){
            const button = document.createElement('button')
            button.id = "bttn";
            button.innerHTML = `Archive`;
            button.addEventListener('click', function() {
              archive(email.id);
              console.log(email);
            });
            document.querySelector('#emails-view').append(button);

          }
        }        

      });

  });
}


function viewEmail (id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
      const sender = email.sender
      const subject = email.subject
      const timestamp = email.timestamp
      const recipients = email.recipients
      const body = email.body
      
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })

      const element = document.createElement('div');
      element.id = "email";

      element.innerHTML = `<p><b>From:</b> ${sender}</p> <p><b>To:</b> ${recipients}</p>  <p><b>Subject:</b> ${subject}</p> <p><b>Timestamp:</b> ${timestamp}</p> <button class="btn btn-sm btn-outline-primary" id='reply'>Reply</button> <hr> <p>${body}</p>`

      document.querySelector('#view').append(element);

      const reply = document.querySelector('#reply');

      reply.addEventListener('click', function(){
        compose_email();
        document.querySelector('#compose-recipients').value = sender;
        const arr = subject.slice(0,3)
        if (arr === 'Re:'){
          document.querySelector('#compose-subject').value = subject;
        }
        else{
          document.querySelector('#compose-subject').value = `Re: ${subject}`;
        }
        document.querySelector('#compose-body').value = `On ${timestamp} ${sender} wrote: ${body}`;
      })
  });
};

function archive (id){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
  .then(() => {
    load_mailbox('inbox')
  })
};

function unarchive (id){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
  .then(() => {
    load_mailbox('inbox')
  })
};

