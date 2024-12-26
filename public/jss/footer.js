const crateFooter = () => {
    let footer = document.querySelector('footer');

    footer.innerHTML = `
    <div class="footer-content">
            <img src="../img/light-logo.png" class="logo" alt="">
            <div class="footer-ul-container">
                <ul class="category">
                    <li class="category-title">men</li>
                    <li><a href="#" class="footer-link">t-shirts</a></li>
                    <li><a href="#" class="footer-link">sweatshirts</a></li>
                    <li><a href="#" class="footer-link">shirts</a></li>
                    <li><a href="#" class="footer-link">jeans</a></li>
                    <li><a href="#" class="footer-link">trousers</a></li>
                    <li><a href="#" class="footer-link">shoes</a></li>
                    <li><a href="#" class="footer-link">casuals</a></li>
                    <li><a href="#" class="footer-link">formals</a></li>
                    <li><a href="#" class="footer-link">watch</a></li>
                    <li><a href="#" class="footer-link">sports</a></li>
                </ul>
                <ul class="category">
                    <li class="category-title">women</li>
                    <li><a href="#" class="footer-link">t-shirts</a></li>
                    <li><a href="#" class="footer-link">sweatshirts</a></li>
                    <li><a href="#" class="footer-link">shirts</a></li>
                    <li><a href="#" class="footer-link">jeans</a></li>
                    <li><a href="#" class="footer-link">trousers</a></li>
                    <li><a href="#" class="footer-link">shoes</a></li>
                    <li><a href="#" class="footer-link">casuals</a></li>
                    <li><a href="#" class="footer-link">formals</a></li>
                    <li><a href="#" class="footer-link">watch</a></li>
                    <li><a href="#" class="footer-link">sports</a></li>
                </ul>
            </div>
        </div>
        <p class="footer-title">about company</p>
        <p class="info">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolores dignissimos delectus facere quidem, voluptatibus necessitatibus nesciunt iusto eaque laudantium nulla perferendis. Voluptas nesciunt earum quidem error recusandae doloribus exercitationem necessitatibus accusantium quasi aspernatur, molestiae distinctio quas, quam aliquam odio deleniti ipsam harum facere culpa numquam iure. Tenetur, corrupti ex. Delectus repellendus eligendi autem quaerat facere, maiores, architecto nostrum quae molestiae temporibus, consectetur incidunt doloremque illo sint labore in nulla ducimus nobis sunt asperiores veniam assumenda totam? Corrupti mollitia praesentium explicabo ipsum quidem repellendus pariatur atque cumque laudantium aperiam asperiores, tenetur aliquam molestiae laboriosam! Sapiente, ex inventore a molestias vero eius!</p>
        <p class="info">support emails - help@clothing.com, customersupport@clothing.com</p>
        <p class="info">telepone - 180 00 00 001, 180 00 00 002</p>
        <div class="footer-social-container">
            <div>
                <a href="#" class="social-link">terms & conditions</a>
                <a href="#" class="social-link">privacy policy</a>
            </div>
            <div>
                <a href="#" class="social-link">instagram</a>
                <a href="#" class="social-link">twitter</a>
                <a href="#" class="social-link">facebook</a>
            </div> 
        </div>
        <p class="footer-credit">Clothing, best apperals online store</p>
    `;
}

crateFooter();